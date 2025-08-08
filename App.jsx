import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- Data for All Journeys ---
const JOURNEYS = {
    dtc: {
        key: 'dtc',
        title: 'Direct-to-Consumer Acceleration',
        description: 'Craft a high-speed purchasing path designed for brand loyalty and rapid conversion.',
        cards: [
            { id: 1, title: 'Smart Search & Personalization', description: 'Helps users discover the right products with intelligent search.', icon: '🔍', hint: "A great D2C journey starts with discovery. How do you help customers find exactly what they need, instantly?" },
            { id: 2, title: 'Dynamic Pricing & Checkout', description: 'Ensures the best deal and a seamless one-click payment experience.', icon: '💰', hint: "Once they've found it, the next step is a frictionless purchase. What feature simplifies pricing and payment?" },
            { id: 3, title: 'Order Fulfillment & Logistics', description: 'Efficient shipping and inventory tracking for fast delivery.', icon: '🚚', hint: "The order is placed. Now, what's the crucial step to get the product into the customer's hands quickly?" },
            { id: 4, title: 'Ratings & Sentiment Analysis', description: 'Gathers customer feedback to build trust and improve products.', icon: '⭐', hint: "The journey isn't over after delivery. How do you gather feedback to fuel future growth and build trust?" }
        ],
        correctSequence: [1, 2, 3, 4]
    },
    omnichannel: {
        key: 'omnichannel',
        title: 'Seamless Omnichannel Integration',
        description: 'Unify your online and physical retail to create a consistent, world-class customer experience.',
        cards: [
            { id: 5, title: 'Unified Customer View (CRM)', description: 'Recognizes customers and their history across all channels.', icon: '👤', hint: "For a true omnichannel experience, you must recognize your customer everywhere. Which feature provides a single identity?" },
            { id: 6, title: 'Hybrid Cart & BOPIS', description: 'Allows users to Buy Online and Pick Up In-Store seamlessly.', icon: '🛍️', hint: "Now that you know the customer, how do you bridge the gap between their online browsing and your physical stores?" },
            { id: 7, title: 'Intelligent Order Routing', description: 'Fulfills online orders from the nearest physical store for speed.', icon: '🏪', hint: "An online order comes in. How do you leverage your network of physical stores to deliver it faster?" },
            { id: 8, title: 'Centralized Inventory', description: 'Provides a single view of stock across all warehouses and stores.', icon: '📦', hint: "To make this all work, you need a single source of truth for your products. What capability is essential for managing stock across all locations?" }
        ],
        correctSequence: [5, 6, 7, 8]
    },
    retailMedia: {
        key: 'retailMedia',
        title: 'Retail Media & Monetization',
        description: 'Transform your marketplace into a high-margin revenue engine with a powerful advertising ecosystem.',
        cards: [
            { id: 9, title: 'Audience & Targeting', description: 'Allows advertisers to target specific, high-intent customer segments.', icon: '🎯', hint: "A successful ad platform is built on precision. What's the first step to ensure brands can reach the right shoppers?" },
            { id: 10, title: 'Self-Serve Ad Platform', description: 'Lets brands easily create and manage their own ad campaigns.', icon: '🛠️', hint: "To scale your ad business, you need to empower brands. What tool allows them to manage their own campaigns efficiently?" },
            { id: 11, title: 'Sponsored Product Ads', description: 'Offers various ad formats like sponsored listings and banners.', icon: '📢', hint: "With targeting and tools in place, what do brands actually use to capture shopper attention on your site?" },
            { id: 12, title: 'Campaign Analytics & ROAS', description: 'Provides brands with detailed reports on their ad performance.', icon: '📈', hint: "Finally, how do you prove the value of your ad platform to brands and encourage them to reinvest?" }
        ],
        correctSequence: [9, 10, 11, 12]
    }
};

// --- CSS Styles ---
const Style = () => (
    <style>{`
        :root {
            --blue-1: #A9C7F9; --blue-2: #689DF4; --blue-3: #2874F0; --blue-4: #1C51A8;
            --yellow-1: #AE9704; --yellow-2: #F8D706; --yellow-3: #FAE350; --yellow-4: #FCEF9B;
            --white-0: #ffffff;
            --correct-glow: #28a745;
            --incorrect-glow: #dc3545;
        }
        html {
            height: 100%;
        }
        body {
            background: linear-gradient(135deg, #e9f0ff, #ffffff);
            margin: 0;
            font-family: 'Poppins', sans-serif;
            color: #0C0E0D;
            height: 100%;
            overflow: hidden; /* Prevent body scrolling */
        }
        #root {
            height: 100%;
        }
        .app-container {
             padding: 1rem; background-color: #f4f9ff; min-height: 100%;
             height: 100%;
             overflow-y: auto; /* Make app container the primary scroller */
             -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
        }
        .header { text-align: center; margin-bottom: 2rem; }
        .header-logo { max-width: 200px; margin-bottom: 1rem; }
        .main-title { font-size: 2rem; font-weight: 700; color: var(--blue-4); text-align: center; margin-bottom: 1rem; }
        .sub-title { font-size: 1.1rem; font-weight: 400; color: #555; text-align: center; margin-bottom: 2rem; max-width: 800px; margin-left: auto; margin-right: auto;}
        .cards-container { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; justify-content: center; min-height: 180px; }
        
        .solitaire-card {
            opacity: 1; background-color: white; border-radius: 12px;
            padding: 1rem; width: 240px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            cursor: move; transition: all 0.2s ease;
            border: 2px solid var(--blue-2);
            position: relative; /* For tooltip positioning */
        }
        .solitaire-card:hover { transform: translateY(-6px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
        .card-dragging { opacity: 0.4; transform: scale(1.05); }
        .card-placed-in-deck { opacity: 0.3; cursor: not-allowed; background-color: #f0f0f0; }
        .card-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .solitaire-card h3 { margin: 8px 0; color: var(--blue-4); font-size: 1.1rem; }
        .solitaire-card p { font-size: 14px; color: #555; line-height: 1.4; }

        .placed-solitaire-card {
            width: 100%; height: 100%; padding: 0.5rem; cursor: default;
            display: flex; flex-direction: column; justify-content: center;
            align-items: center; text-align: center;
        }
        .placed-solitaire-card .card-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .placed-solitaire-card h3 { font-size: 0.9rem; margin: 4px 0; }
        .placed-solitaire-card p { display: none; }

        .correct-placement { box-shadow: 0 0 15px 5px var(--correct-glow); border-color: var(--correct-glow); }
        .incorrect-placement { 
            box-shadow: 0 0 15px 5px var(--incorrect-glow); 
            border-color: var(--incorrect-glow);
            cursor: pointer;
        }
        
        /* Tooltip Styles */
        .tooltip {
            visibility: hidden;
            width: 160px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 8px;
            position: absolute;
            z-index: 10;
            bottom: 105%;
            left: 50%;
            margin-left: -80px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 0.8rem;
            pointer-events: none;
        }
        .tooltip::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #333 transparent transparent transparent;
        }
        .incorrect-placement:hover .tooltip {
            visibility: visible;
            opacity: 1;
        }

        .journey-path-container {
            position: relative; display: flex; justify-content: center;
            align-items: center; gap: 2rem; padding: 2rem 0; margin-bottom: 2rem;
        }
        .journey-line {
            position: absolute; top: 50%; left: 10%; right: 10%;
            height: 4px; background-color: var(--blue-2); z-index: 1;
        }
        .droppable-slot {
            height: 160px; width: 200px; border: 3px dashed #ccc;
            border-radius: 12px; background-color: #fff; display: flex;
            align-items: center; justify-content: center;
            transition: background-color 0.3s, border-color 0.3s;
            color: #aaa; font-style: italic;
            position: relative; z-index: 2; padding: 0.5rem;
        }
        .slot-number {
            position: absolute; top: -15px; left: -15px; background-color: var(--blue-3);
            color: white; border-radius: 50%; width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; border: 2px solid white;
        }
        .droppable-slot-over { background-color: #e3ecff; border-color: var(--blue-3); }
        
        .button-container { text-align: center; margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .btn {
            color: white; padding: 12px 24px; font-size: 1rem;
            border: none; border-radius: 10px; cursor: pointer;
            font-weight: 600; transition: all 0.2s; flex-grow: 1; max-width: 250px;
            position: relative;
        }
        .btn:hover { transform: scale(1.05); }
        .submit-btn { background-color: var(--blue-3); box-shadow: 0 4px var(--blue-4); }
        .reset-btn { background: #E91E63; box-shadow: 0 4px #ad1457; }
        .back-btn { background-color: #6c757d; box-shadow: 0 4px #495057; }
        .hint-btn { background-color: var(--yellow-2); color: #333; box-shadow: 0 4px var(--yellow-1); }
        .linkedin-btn { 
            background-color: #0077b5; box-shadow: 0 4px #005582;
            display: flex; align-items: center; justify-content: center;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            70% {
                transform: scale(1.1);
                box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
        }

        .info-icon {
            display: inline-flex; align-items: center; justify-content: center;
            width: 20px; height: 20px; border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3); color: white;
            font-weight: bold; font-style: italic; margin-left: 8px;
            font-size: 14px; position: relative; cursor: help;
            animation: pulse 2s infinite;
        }
        .info-tooltip {
            visibility: hidden; width: 220px; background-color: #333;
            color: #fff; text-align: center; border-radius: 6px;
            padding: 8px; position: absolute; z-index: 10;
            bottom: 125%; left: 50%; margin-left: -110px;
            opacity: 0; transition: opacity 0.3s; font-size: 12px;
            font-style: normal; pointer-events: none;
        }
        .info-tooltip::after {
            content: ""; position: absolute; top: 100%; left: 50%;
            margin-left: -5px; border-width: 5px; border-style: solid;
            border-color: #333 transparent transparent transparent;
        }
        .info-icon:hover .info-tooltip { visibility: visible; opacity: 1; }

        .copy-feedback {
            position: absolute; bottom: -30px; left: 50%;
            transform: translateX(-50%); background-color: #28a745;
            color: white; padding: 4px 12px; border-radius: 4px;
            font-size: 0.8rem; white-space: nowrap;
        }

        .message-box { margin: 20px auto; padding: 14px 20px; border-radius: 8px; font-weight: 500; text-align: center; font-size: 1rem; max-width: 600px; }
        .success-msg { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error-msg { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .hint-box { background-color: #fffbe6; color: #665c00; font-style: italic; }

        .journey-selection-container { text-align: center; }
        .journey-options { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .journey-card {
            background: var(--white-0); border: 2px solid var(--blue-2); border-radius: 16px;
            padding: 1.5rem; width: 100%; max-width: 320px; cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .journey-card:hover { transform: translateY(-10px); box-shadow: 0 12px 24px rgba(40, 116, 240, 0.2); }
        .journey-card h3 { font-size: 1.25rem; color: var(--blue-4); margin-top: 0; }
        .journey-card p { color: #555; font-size: 0.9rem; }

        /* --- MOBILE RESPONSIVE STYLES --- */
        @media (max-width: 768px) {
            .main-title { font-size: 1.8rem; }
            .sub-title { font-size: 1rem; }

            .journey-path-container {
                flex-direction: column;
                gap: 3rem; /* Increased gap for vertical stacking */
            }
            .journey-line {
                /* Change line from horizontal to vertical */
                top: 5%;
                bottom: 5%;
                left: 50%;
                width: 4px;
                height: 90%;
                transform: translateX(-2px);
            }
            .droppable-slot {
                width: 80%;
                max-width: 280px;
                height: 180px; /* Taller slots for easier dropping */
            }
            .solitaire-card {
                width: 90%;
                max-width: 300px;
            }
            .button-container {
                flex-direction: column;
                align-items: center;
            }
            .btn {
                width: 100%;
                max-width: 320px; /* Consistent button width */
            }
        }
    `}</style>
);

// --- Child Components ---

const ConfettiComponent = ({ recycle }) => {
    const canvasRef = useRef(null);
    const recycleRef = useRef(recycle);

    useEffect(() => {
        recycleRef.current = recycle;
    }, [recycle]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let { width, height } = document.body.getBoundingClientRect();
        canvas.width = width; canvas.height = height;
        let particles = [];
        const colors = ['#2874F0', '#F8D706', '#E91E63', '#4CAF50', '#ffffff'];
        class Particle {
            constructor() { this.x = Math.random() * width; this.y = Math.random() * height - height; this.vx = Math.random() * 4 - 2; this.vy = Math.random() * 3 + 2; this.size = Math.random() * 8 + 4; this.color = colors[Math.floor(Math.random() * colors.length)]; this.angle = Math.random() * Math.PI * 2; this.rotationSpeed = Math.random() * 0.1 - 0.05; }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.rotationSpeed;
                if (this.y > height + this.size) {
                    if (recycleRef.current) {
                        this.y = -this.size;
                        this.x = Math.random() * width;
                    }
                }
            }
            draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle); ctx.fillStyle = this.color; ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size); ctx.restore(); }
        }
        for (let i = 0; i < 200; i++) particles.push(new Particle());
        let animationFrameId;
        const animate = () => { ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); animationFrameId = requestAnimationFrame(animate); };
        animate();
        const handleResize = () => { ({ width, height } = document.body.getBoundingClientRect()); canvas.width = width; canvas.height = height; };
        window.addEventListener('resize', handleResize);
        return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

function DeckCard({ card, isPlaced }) {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'CARD', item: { id: card.id }, canDrag: !isPlaced,
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));
    return (
        <div ref={dragRef} className={`solitaire-card ${isDragging ? 'card-dragging' : ''} ${isPlaced ? 'card-placed-in-deck' : ''}`}>
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
        </div>
    );
}

function PlacedCard({ card, isCorrect, onRemove }) {
    const cardClasses = `solitaire-card placed-solitaire-card ${isCorrect ? 'correct-placement' : 'incorrect-placement'}`;
    
    const handleCardClick = () => {
        if (!isCorrect) {
            onRemove(card.id);
        }
    };

    return (
        <div className={cardClasses} onClick={handleCardClick}>
            {!isCorrect && <span className="tooltip">Wrong step! Click to remove.</span>}
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
        </div>
    );
}

function DroppableSlot({ slotIndex, placedCards, setPlacedCards, journey, onRemoveCard }) {
    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: 'CARD',
        drop: (item) => {
            const isSlotFilled = placedCards.some((c) => c.slotIndex === slotIndex);
            const isCardPlaced = placedCards.some((c) => c.cardId === item.id);
            if (!isSlotFilled && !isCardPlaced) {
                setPlacedCards((prev) => [...prev, { cardId: item.id, slotIndex }]);
            }
        },
        collect: (monitor) => ({ isOver: monitor.isOver() }),
    }));
    const placedCardInfo = placedCards.find((c) => c.slotIndex === slotIndex);
    const cardData = placedCardInfo ? journey.cards.find((c) => c.id === placedCardInfo.cardId) : null;
    const isCorrect = placedCardInfo ? placedCardInfo.cardId === journey.correctSequence[slotIndex] : false;

    return (
        <div ref={dropRef} className={`droppable-slot ${isOver ? 'droppable-slot-over' : ''}`}>
            <div className="slot-number">{slotIndex + 1}</div>
            {cardData ? <PlacedCard card={cardData} isCorrect={isCorrect} onRemove={onRemoveCard} /> : <span>Drop card here</span>}
        </div>
    );
}

// --- Screen Components ---

const JourneySelectionScreen = ({ onSelectJourney }) => (
    <div className="journey-selection-container">
        <div className="header">
            <img src="https://www.flipkartcommercecloud.com/uploads/header-logo-172827965567037467a1c85.png" alt="Flipkart Commerce Cloud Logo" className="header-logo" />
        </div>
        <h1 className="main-title">Build Your Ideal Commerce Experience</h1>
        <p className="sub-title">Select a journey to discover how Flipkart Commerce Cloud's modular solutions can be sequenced to solve your specific business goals—from accelerating D2C growth to unifying omnichannel retail.</p>
        <div className="journey-options">
            {Object.values(JOURNEYS).map(journey => (
                <div key={journey.key} className="journey-card" onClick={() => onSelectJourney(journey.key)}>
                    <h3>{journey.title}</h3>
                    <p>{journey.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const GameScreen = ({ journey, onBack }) => {
    const [placedCards, setPlacedCards] = useState([]);
    const [shuffledCards, setShuffledCards] = useState([]);
    const [message, setMessage] = useState('');
    const [hint, setHint] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [recycleConfetti, setRecycleConfetti] = useState(true);
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const scrollTargetRef = useRef(null); 

    // Effect to scroll to the bottom when a message or hint appears
    useEffect(() => {
        if (message || hint) {
            scrollTargetRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [message, hint]);

    // Shuffle the cards only when the journey changes
    useEffect(() => {
        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };
        setShuffledCards(shuffleArray(journey.cards));
    }, [journey]);

    const placedCardIds = useMemo(() => new Set(placedCards.map(p => p.cardId)), [placedCards]);

    const checkCompletion = () => {
        if (placedCards.length !== journey.correctSequence.length) return false;
        const sortedPlacedCards = [...placedCards].sort((a, b) => a.slotIndex - b.slotIndex);
        return sortedPlacedCards.every((card, i) => card.cardId === journey.correctSequence[i]);
    };

    const handleSubmit = () => {
        setHint('');
        if (checkCompletion()) {
            setMessage('🎉 Correct sequence! You completed the journey!');
            setIsCompleted(true);
            setShowConfetti(true);
            setRecycleConfetti(true);
            setTimeout(() => setRecycleConfetti(false), 4000); 
            setTimeout(() => setShowConfetti(false), 8000); 
        } else {
            setMessage('❌ Incorrect sequence. The glowing cards show which steps are right or wrong. Try again!');
            setIsCompleted(false);
        }
    };

    const handleRemoveCard = (cardIdToRemove) => {
        setPlacedCards(prevPlacedCards => 
            prevPlacedCards.filter(card => card.cardId !== cardIdToRemove)
        );
    };

    const handleReset = () => { 
        setPlacedCards([]); 
        setMessage(''); 
        setHint(''); 
        setIsCompleted(false);
        setShowConfetti(false);
        // Re-shuffle cards on reset for a new game experience
        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };
        setShuffledCards(shuffleArray(journey.cards));
    };

    const handleGetHint = () => {
        const firstEmptySlotIndex = journey.correctSequence.findIndex((_, index) => !placedCards.some(p => p.slotIndex === index));
        if (firstEmptySlotIndex === -1) {
            setHint("You've placed all the cards! Try submitting your journey.");
            return;
        }
        const correctCardId = journey.correctSequence[firstEmptySlotIndex];
        const correctCard = journey.cards.find(c => c.id === correctCardId);
        if (correctCard) { setHint(correctCard.hint); }
    };

    const handleLinkedInShare = () => {
        const postText = `I've just completed the "${journey.title}" challenge on the Flipkart Commerce Cloud Solitaire microsite! It's a fun, interactive way to learn about building powerful digital commerce experiences. #FlipkartCommerceCloud #DigitalCommerce #${journey.key}`;
        
        // Copy text to clipboard
        const textArea = document.createElement("textarea");
        textArea.value = postText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Show feedback to user
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);

        // Open LinkedIn share window
        const siteUrl = "https://www.flipkartcommercecloud.com/";
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;
        window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <DndProvider backend={HTML5Backend}>
            {showConfetti && <ConfettiComponent recycle={recycleConfetti} />}
            <div className="header">
                <img src="https://www.flipkartcommercecloud.com/uploads/header-logo-172827965567037467a1c85.png" alt="Flipkart Commerce Cloud Logo" className="header-logo" />
            </div>
            <h1 className="main-title">{journey.title}</h1>
            <p className="sub-title">Drag and drop the feature cards from your deck into the correct sequence below to build your optimal commerce journey.</p>
            
            <div className="cards-container">
                {shuffledCards.map((card) => (
                    <DeckCard key={card.id} card={card} isPlaced={placedCardIds.has(card.id)} />
                ))}
            </div>

            <h2 className="main-title" style={{fontSize: '1.8rem', marginBottom: '0'}}>Your Digital Commerce Journey</h2>
            <div className="journey-path-container">
                <div className="journey-line"></div>
                {Array.from({ length: journey.correctSequence.length }).map((_, i) => (
                    <DroppableSlot 
                        key={i} 
                        slotIndex={i} 
                        placedCards={placedCards} 
                        setPlacedCards={setPlacedCards} 
                        journey={journey}
                        onRemoveCard={handleRemoveCard}
                    />
                ))}
            </div>

            <div className="button-container">
                <button onClick={handleSubmit} className="btn submit-btn">Submit Journey</button>
                {!isCompleted && <button onClick={handleGetHint} className="btn hint-btn">Get a Hint</button>}
                {isCompleted && (
                    <button onClick={handleLinkedInShare} className="btn linkedin-btn">
                        Share on LinkedIn
                        <span className="info-icon">
                            i
                            <span className="info-tooltip">
                                We've copied the post text for you. Just paste it into the LinkedIn window!
                            </span>
                        </span>
                        {showCopyMessage && <span className="copy-feedback">Copied!</span>}
                    </button>
                )}
                <button onClick={handleReset} className="btn reset-btn">Reset</button>
                <button onClick={onBack} className="btn back-btn">Back to Journeys</button>
            </div>
            
            <div ref={scrollTargetRef}>
                {hint && !message && <div className="message-box hint-box">{hint}</div>}
                {message && <div className={`message-box ${isCompleted ? 'success-msg' : 'error-msg'}`}>{message}</div>}
            </div>
        </DndProvider>
    );
};

// --- Main App Component ---

function App() {
    const [selectedJourneyKey, setSelectedJourneyKey] = useState(null);
    const handleSelectJourney = (key) => setSelectedJourneyKey(key);
    const handleBackToSelection = () => setSelectedJourneyKey(null);

    return (
        <>
            <Style />
            <div className="app-container">
                {!selectedJourneyKey ? (
                    <JourneySelectionScreen onSelectJourney={handleSelectJourney} />
                ) : (
                    <GameScreen journey={JOURNEYS[selectedJourneyKey]} onBack={handleBackToSelection} />
                )}
            </div>
        </>
    );
}

export default App;
