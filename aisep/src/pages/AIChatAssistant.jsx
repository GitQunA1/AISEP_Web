import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  History, 
  Plus, 
  MessageSquare, 
  Bot, 
  User, 
  ArrowRight,
  Info,
  ChevronRight,
  Mic,
  Image as ImageIcon,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import styles from './AIChatAssistant.module.css';
import RightPanel from '../components/layout/RightPanel';

/**
 * AIChatAssistant - Premium AI Chat Experience
 * Features:
 * - Real-time chat UI (mocked)
 * - Suggested questions
 * - Chat history access
 * - Introduction and feature highlights
 */
const AIChatAssistant = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: 'Xin chào! Tôi là Trợ lý AI của AISEP. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi về cách tối ưu hồ sơ, tìm kiếm nhà đầu tư phù hợp, hoặc giải đáp các thắc mắc về hệ sinh thái khởi nghiệp.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        // Only scroll if we added a new message
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages]);

    const suggestedQuestions = [
        "Làm sao để tăng điểm AI cho hồ sơ startup của tôi?",
        "Tìm các nhà đầu tư quan tâm đến lĩnh vực AgriTech.",
        "Tôi cần chuẩn bị những gì trước khi gửi Pitch cho nhà đầu tư?",
        "Giải thích về quy trình kết nối với cố vấn trên AISEP."
    ];

    const handleSend = () => {
        if (!input.trim()) return;

        const newUserMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput('');

        // Mock AI response
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Cảm ơn bạn đã đặt câu hỏi. Hiện tại tính năng phản hồi thực tế đang được phát triển bộ phận Backend. Tôi đã ghi nhận nội dung của bạn: "' + input + '". Rất sớm thôi, tôi sẽ có thể phân tích sâu và hỗ trợ bạn một cách chính xác nhất!',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleSuggestClick = (question) => {
        setInput(question);
    };

    return (
        <div className={styles.aiContainer}>
            {/* Left Side: Chat Column */}
            <div className={styles.chatColumn}>
                {/* Header Area (Fixed Top of Chat) */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <div className={styles.aiIcon}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h1>Trợ lý AI</h1>
                            <p>Thông minh · Tức thì · Chuyên nghiệp</p>
                        </div>
                    </div>
                    <button 
                        className={`${styles.historyBtn} ${showHistory ? styles.historyActive : ''}`}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <History size={18} />
                        <span className={styles.hideOnMobile}>Lịch sử</span>
                    </button>
                </div>

                {/* Main Chat Flow (Scrollable area on Desktop) */}
                <div className={styles.chatScrollArea}>
                    
                    {/* Welcome & Features (Only shown when chat is empty) */}
                    {messages.length === 1 && (
                        <div className={styles.welcomeSection}>
                            <div className={styles.welcomeHero}>
                                <Bot size={56} className={styles.botHeroIcon} />
                                <h2>Chào mừng bạn đến với AI Hub</h2>
                                <p>Hãy đặt bất kỳ câu hỏi nào để bắt đầu hành trình khởi nghiệp của bạn.</p>
                            </div>
                            <div className={styles.featuresGrid}>
                                <div className={styles.featureCard}>
                                    <Target size={24} className={styles.fIcon} />
                                    <h3>Tối ưu hóa Pitch</h3>
                                    <p>Giúp bạn hoàn thiện bản trình bày trước nhà đầu tư.</p>
                                </div>
                                <div className={styles.featureCard}>
                                    <TrendingUp size={24} className={styles.fIcon} />
                                    <h3>Phân tích thị trường</h3>
                                    <p>Cập nhật xu hướng và dữ liệu mới nhất.</p>
                                </div>
                                <div className={styles.featureCard}>
                                    <Users size={24} className={styles.fIcon} />
                                    <h3>Kết nối thông minh</h3>
                                    <p>Gợi ý đối tác phù hợp dựa trên thuật toán AI.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages Flow */}
                    <div className={styles.messageList}>
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userRow : styles.assistantRow}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className={styles.messageAvatar}>
                                        <Bot size={18} />
                                    </div>
                                )}
                                <div className={styles.messageContent}>
                                    <div className={styles.messageBubble}>
                                        {msg.content}
                                    </div>
                                    <span className={styles.msgTime}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Sticky Input Area */}
                    <div className={styles.inputStickyWrapper}>
                        {/* Feedback/Suggestions while empty input - Moved here to stick above input */}
                        {input.length === 0 && messages.length === 1 && (
                            <div className={styles.suggestionArea}>
                                <p className={styles.suggestionTitle}>
                                    <Sparkles size={14} /> Có thể bạn quan tâm:
                                </p>
                                <div className={styles.suggestions}>
                                    {suggestedQuestions.map((q, idx) => (
                                        <button 
                                            key={idx} 
                                            className={styles.suggestionChip}
                                            onClick={() => handleSuggestClick(q)}
                                        >
                                            <span>{q}</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className={styles.inputContainer}>
                            <div className={styles.inputActions}>
                                <button className={styles.iconBtn} aria-label="Thêm đính kèm"><Plus size={20} /></button>
                                <button className={styles.iconBtn} aria-label="Tải ảnh lên"><ImageIcon size={20} /></button>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Nhập câu hỏi tại đây..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className={styles.chatInput}
                            />
                            <div className={styles.inputActions}>
                                <button className={styles.iconBtn} aria-label="Nhập bằng giọng nói"><Mic size={20} /></button>
                                <button 
                                    className={`${styles.sendBtn} ${input.trim() ? styles.sendActive : ''}`}
                                    onClick={handleSend}
                                    aria-label="Gửi tin nhắn"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        <p className={styles.disclaimer}>
                            AI có thể đưa ra câu trả lời chưa chính xác. Hãy kiểm chứng lại các thông tin quan trọng.
                        </p>
                    </div>
                </div>

                {/* History Sidebar Backdrop Overlay */}
                <div 
                    className={`${styles.historyOverlay} ${showHistory ? styles.open : ''}`}
                    onClick={() => setShowHistory(false)}
                    aria-label="Đóng lịch sử"
                    role="button"
                    tabIndex={0}
                />

                {/* History Sidebar - Now inside chatColumn */}
                <aside className={`${styles.historySidebar} ${showHistory ? styles.open : ''}`}>
                    <div className={styles.historyHeader}>
                            <h3>Lịch sử trò chuyện</h3>
                            <button className={styles.newChatBtn}><Plus size={16} /> Chat mới</button>
                        </div>
                        <div className={styles.historyList}>
                            <div className={styles.historyItem}>
                                <MessageSquare size={16} />
                                <span>Tối ưu hồ sơ AgriTech...</span>
                                <ChevronRight size={14} />
                            </div>
                            <div className={styles.historyItem}>
                                <MessageSquare size={16} />
                                <span>Tìm nhà đầu tư SaaS...</span>
                                <ChevronRight size={14} />
                            </div>
                            <div className={styles.historyItem}>
                                <MessageSquare size={16} />
                                <span>Hướng dẫn Pitch Deck...</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </aside>
            </div>

            {/* Right Widgets Section (Integrated into grid) */}
            <div className={styles.widgetsSection}>
                <RightPanel className={styles.aiRightPanelOverride} />
            </div>
        </div>
    );
};

export default AIChatAssistant;

