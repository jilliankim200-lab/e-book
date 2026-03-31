import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, Search, Send, ArrowRight } from "lucide-react";
import { FAQ_CATEGORIES, FAQ_ITEMS, FaqItem } from "./faqData";

interface ChatMsg {
  type: "user" | "bot";
  content: string;
  faqId?: string;
}

const BOT_AVATAR = "/images/j-avatar.png";
const isMobile = /Android|iPhone|iPad|iPod|Mobile|Fold|Flip/i.test(navigator.userAgent);

export function FaqChatbot({ hidden }: { hidden?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"home" | "category" | "chat">("home");
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    }
  }, [chatHistory, view]);

  if (hidden) return null;

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setView("category");
    setSearchQuery("");
  };

  const selectFaq = (faq: FaqItem) => {
    setChatHistory(prev => [
      ...prev,
      { type: "user", content: faq.question },
      { type: "bot", content: faq.answer, faqId: faq.id },
    ]);
    setView("chat");
    setSearchQuery("");
  };

  const goHome = () => {
    setView("home");
    setActiveCategory("");
    setSearchQuery("");
  };

  const filteredFaqs = searchQuery.trim()
    ? FAQ_ITEMS.filter(f => {
        const q = searchQuery.toLowerCase();
        return f.question.toLowerCase().includes(q) || f.keywords.some(k => k.includes(q));
      })
    : [];

  const categoryFaqs = activeCategory
    ? FAQ_ITEMS.filter(f => f.categoryId === activeCategory)
    : [];

  const lastFaq = chatHistory.filter(m => m.faqId).slice(-1)[0];
  const relatedFaqs = lastFaq
    ? FAQ_ITEMS.filter(f => {
        const source = FAQ_ITEMS.find(s => s.id === lastFaq.faqId);
        return source?.relatedIds?.includes(f.id);
      })
    : [];

  // 검색어 하이라이트
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: "#FEF08A", color: "#92400E", fontWeight: 700, borderRadius: 2, padding: "0 1px" }}>{part}</mark>
        : part
    );
  };

  // 질문 리스트 아이템
  const QItem = ({ faq }: { faq: FaqItem }) => (
    <button onClick={() => selectFaq(faq)} className="faq-q-item" style={{
      width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "none", border: "none", borderBottom: "1px solid var(--border-secondary, #f3f4f6)",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "background 0.1s",
    }}>
      <span style={{ fontSize: isMobile ? 16 : 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{highlightMatch(faq.question, searchQuery)}</span>
      <ArrowRight size={14} color="var(--text-quaternary, #d1d5db)" style={{ flexShrink: 0, marginLeft: 8 }} />
    </button>
  );

  return createPortal(
    <>
      {/* ── 플로팅 버튼 ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="faq-fab"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: "50%",
          border: "1px solid var(--border-primary, #e5e7eb)",
          background: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease", overflow: "hidden",
        }}
      >
        {isOpen
          ? <X size={20} color="var(--text-tertiary)" />
          : <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
              <img src={BOT_AVATAR} alt="J" style={{ width: "130%", height: "auto", marginTop: "10%" }} />
            </div>
        }
      </button>

      {/* ── 채팅 창 ── */}
      {isOpen && (
        <div
          className="faq-chat-window"
          style={{
            position: "fixed", bottom: 92, right: 24, zIndex: 1000,
            width: 380, height: 560,
            borderRadius: 16, overflow: "hidden",
            background: "#fff",
            boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column" as const,
            animation: "faq-in 0.2s ease",
          }}
        >
          {/* ── 헤더 ── */}
          {view !== "home" && (
            <div style={{
              padding: "0 20px", height: 52, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--border-secondary, #f3f4f6)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={goHome} className="faq-icon-btn" style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: 4, display: "flex", color: "var(--text-tertiary)",
                  borderRadius: 6, transition: "background 0.1s",
                }}>
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                  {view === "category" ? FAQ_CATEGORIES.find(c => c.id === activeCategory)?.label : "대화"}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="faq-icon-btn" style={{
                background: "none", border: "none", cursor: "pointer", padding: 6,
                color: "var(--text-tertiary)", display: "flex", borderRadius: 8,
                transition: "background 0.1s",
              }}>
                <X size={16} />
              </button>
            </div>
          )}
          {view === "home" && (
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0", flexShrink: 0 }}>
              <button onClick={() => setIsOpen(false)} className="faq-icon-btn" style={{
                background: "none", border: "none", cursor: "pointer", padding: 6,
                color: "var(--text-tertiary)", display: "flex", borderRadius: 8,
                transition: "background 0.1s",
              }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* ── 콘텐츠 ── */}
          <div ref={scrollRef} className="auto-hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>

            {/* 검색 결과 */}
            {searchQuery.trim() ? (
              filteredFaqs.length > 0 ? (
                <div>{filteredFaqs.map(faq => <QItem key={faq.id} faq={faq} />)}</div>
              ) : (
                <div style={{ padding: 48, textAlign: "center" as const, color: "var(--text-tertiary)", fontSize: isMobile ? 16 : 14 }}>
                  검색 결과가 없습니다
                </div>
              )

            ) : view === "home" ? (
              <div style={{ display: "flex", flexDirection: "column" as const, height: "100%" }}>
                {/* 인사 영역 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "center", border: "3px solid var(--border-secondary, #f3f4f6)" }}>
                    <img src={BOT_AVATAR} alt="J" style={{ width: "130%", height: "auto", marginTop: "10%" }} />
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px", textAlign: "center" as const, lineHeight: 1.5 }}>
                    안녕하세요.<br />탈출 조력자 J입니다.
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0, textAlign: "center" as const }}>
                    무엇을 도와드릴까요?
                  </p>
                </div>

                {/* 하단 말풍선 + 카테고리 */}
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                      <img src={BOT_AVATAR} alt="J" style={{ width: "130%", height: "auto", marginTop: "10%" }} />
                    </div>
                    <div>
                      <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "#f4f4f5", fontSize: isMobile ? 16 : 14, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 10 }}>
                        궁금한 내용을 선택해주세요
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                        {FAQ_CATEGORIES.map(cat => (
                          <button key={cat.id} onClick={() => selectCategory(cat.id)} className="faq-cat-btn" style={{
                            padding: "7px 14px", borderRadius: 20,
                            border: "1px solid var(--border-primary, #e5e7eb)",
                            background: "#fff", cursor: "pointer",
                            fontFamily: "inherit", fontSize: isMobile ? 15 : 13, fontWeight: 500,
                            color: "var(--text-primary)", transition: "all 0.15s",
                          }}>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            ) : view === "category" ? (
              <div>
                {categoryFaqs.map(faq => <QItem key={faq.id} faq={faq} />)}
              </div>

            ) : (
              /* ── 채팅 ── */
              <div style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column" as const, gap: 14 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8,
                    flexDirection: msg.type === "user" ? "row-reverse" as const : "row" as const,
                    alignItems: "flex-end",
                  }}>
                    {msg.type === "bot" && (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                        <img src={BOT_AVATAR} alt="J" style={{ width: "130%", height: "auto", marginTop: "10%" }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: "80%", padding: "10px 14px",
                      fontSize: isMobile ? 16 : 14, lineHeight: 1.7, whiteSpace: "pre-line" as const,
                      ...(msg.type === "user"
                        ? { background: "var(--text-primary, #1e293b)", color: "#fff", borderRadius: "16px 16px 4px 16px" }
                        : { background: "#f4f4f5", color: "var(--text-primary)", borderRadius: "16px 16px 16px 4px" }
                      ),
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {relatedFaqs.length > 0 && (
                  <div style={{ paddingLeft: 32, paddingTop: 4 }}>
                    <p style={{ fontSize: isMobile ? 14 : 12, color: "var(--text-tertiary)", marginBottom: 8 }}>관련 질문</p>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                      {relatedFaqs.map(faq => (
                        <button key={faq.id} onClick={() => selectFaq(faq)} className="faq-related-btn" style={{
                          padding: "8px 14px", borderRadius: 10, fontSize: isMobile ? 15 : 13,
                          border: "1px solid var(--border-primary, #e5e7eb)",
                          background: "#fff", color: "var(--text-primary)",
                          cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                          textAlign: "left" as const, transition: "all 0.1s", lineHeight: 1.4,
                        }}>
                          {faq.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 하단 입력 ── */}
          <div style={{
            padding: "12px 16px", flexShrink: 0,
            borderTop: "1px solid var(--border-secondary, #f3f4f6)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
              height: 44, borderRadius: 22,
              background: "#f4f4f5",
            }}>
              <Search size={15} color="var(--text-quaternary, #a1a1aa)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="검색하기..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredFaqs.length > 0) selectFaq(filteredFaqs[0]);
                }}
                style={{
                  flex: 1, border: "none", background: "transparent", outline: "none",
                  fontSize: isMobile ? 16 : 14, color: "var(--text-primary)", fontFamily: "inherit",
                }}
              />
              {searchQuery.trim() && (
                <button onClick={() => { if (filteredFaqs.length > 0) selectFaq(filteredFaqs[0]); }} style={{
                  background: "var(--text-primary, #1e293b)", border: "none", borderRadius: "50%",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, transition: "all 0.1s",
                }}>
                  <Send size={13} color="#fff" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes faq-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .faq-fab:hover {
          transform: scale(1.06);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .faq-icon-btn:hover { background: var(--bg-secondary, #f3f4f6) !important; }
        .faq-q-item:hover { background: var(--bg-secondary, #f9fafb) !important; }
        .faq-cat-btn:hover { border-color: var(--text-primary) !important; background: var(--bg-secondary, #f9fafb) !important; }
        .faq-related-btn:hover { border-color: var(--text-primary) !important; }
        @media (max-width: 768px) {
          .faq-chat-window {
            width: calc(100vw - 32px) !important;
            right: 16px !important;
            bottom: 84px !important;
            height: calc(100vh - 110px) !important;
          }
          .faq-fab { bottom: 16px !important; right: 16px !important; }
        }
      `}</style>
    </>,
    document.body
  );
}
