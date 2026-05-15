import React, { useState, useCallback } from 'react';

// 卡牌接口
interface Card {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 融合配方接口
interface Recipe {
  ingredients: [string, string];
  result: string;
}

// 探索点接口
interface ExplorePoint {
  id: string;
  x: number;
  y: number;
  cardId: string;
  collected: boolean;
  icon: string;
  name: string;
}

// 谜题接口
interface Puzzle {
  id: string;
  name: string;
  x: number;
  y: number;
  requiredCardId: string;
  solved: boolean;
  description: string;
  solvedIcon: string;
  unsolvedIcon: string;
}

// 场景接口
interface Scene {
  id: string;
  name: string;
  description: string;
  bgFrom: string;
  bgTo: string;
  explorePoints: ExplorePoint[];
  puzzles: Puzzle[];
  goalPuzzle: string;
  decorations: { icon: string; x: number; y: number; size: string }[];
}

// 所有卡牌定义
const ALL_CARDS: Record<string, Card> = {
  fire: { id: 'fire', name: '火焰', icon: '🔥', description: '炽热的火焰，可以燃烧物品' },
  water: { id: 'water', name: '水滴', icon: '💧', description: '清澈的水滴，生命之源' },
  seed: { id: 'seed', name: '种子', icon: '🌰', description: '蕴含生命力的神奇种子' },
  key: { id: 'key', name: '钥匙', icon: '🔑', description: '古老的钥匙，能打开某些封印' },
  bottle: { id: 'bottle', name: '空瓶', icon: '🫙', description: '空空如也的玻璃瓶' },
  stone: { id: 'stone', name: '石块', icon: '🪨', description: '坚硬的石块，可用于制作工具' },
  branch: { id: 'branch', name: '树枝', icon: '🪵', description: '干燥的树枝，易燃且坚韧' },
  sprout: { id: 'sprout', name: '嫩芽', icon: '🌱', description: '刚发芽的种子，充满希望' },
  torch: { id: 'torch', name: '火炬', icon: '🔦', description: '燃烧的火炬，照亮黑暗' },
  waterBottle: { id: 'waterBottle', name: '水瓶', icon: '🍶', description: '装满清水的瓶子' },
  ashes: { id: 'ashes', name: '灰烬', icon: '🪨', description: '燃烧后的残留物' },
  flower: { id: 'flower', name: '鲜花', icon: '🌸', description: '绽放的美丽花朵' },
  crowbar: { id: 'crowbar', name: '撬棍', icon: '🔧', description: '简陋但实用的撬棍' },
  wind: { id: 'wind', name: '风', icon: '💨', description: '轻柔但有力的微风' },
  cloud: { id: 'cloud', name: '乌云', icon: '☁️', description: '乌云，雨水的来源' },
  rain: { id: 'rain', name: '雨水', icon: '🌧️', description: '滋润万物的雨水' },
  treasure: { id: 'treasure', name: '宝物', icon: '💎', description: '稀世珍宝！' },
  gem: { id: 'gem', name: '宝石', icon: '💠', description: '闪闪发光的宝石' },
  book: { id: 'book', name: '魔法书', icon: '📖', description: '记载着古老魔法的书籍' },
  star: { id: 'star', name: '星星', icon: '⭐', description: '闪烁的星光碎片' },
};

// 融合配方
const RECIPES: Recipe[] = [
  { ingredients: ['water', 'seed'], result: 'sprout' },
  { ingredients: ['fire', 'seed'], result: 'ashes' },
  { ingredients: ['fire', 'branch'], result: 'torch' },
  { ingredients: ['water', 'bottle'], result: 'waterBottle' },
  { ingredients: ['stone', 'branch'], result: 'crowbar' },
  { ingredients: ['waterBottle', 'sprout'], result: 'flower' },
  { ingredients: ['rain', 'sprout'], result: 'flower' },
  { ingredients: ['cloud', 'wind'], result: 'rain' },
  { ingredients: ['water', 'flower'], result: 'star' },
  { ingredients: ['fire', 'stone'], result: 'gem' },
];

// 游戏场景数据
const createScenes = (): Scene[] => [
  {
    id: 'tutorial',
    name: '魔法森林入口',
    description: '欢迎来到卡牌融合工坊！点击发光的物品收集卡牌，将卡牌拖入融合法阵进行组合，解开谜题吧！',
    bgFrom: 'from-green-400',
    bgTo: 'to-emerald-600',
    explorePoints: [
      { id: 'e1', x: 15, y: 60, cardId: 'fire', collected: false, icon: '🔥', name: '火焰' },
      { id: 'e2', x: 30, y: 45, cardId: 'branch', collected: false, icon: '🪵', name: '树枝' },
      { id: 'e3', x: 85, y: 60, cardId: 'key', collected: false, icon: '🔑', name: '钥匙' },
    ],
    puzzles: [
      {
        id: 'p1',
        name: '熄灭的火炬',
        x: 60,
        y: 35,
        requiredCardId: 'torch',
        solved: false,
        description: '这个火炬熄灭了，需要点燃它才能继续前进',
        solvedIcon: '🔥',
        unsolvedIcon: '🪔',
      },
    ],
    goalPuzzle: 'p1',
    decorations: [
      { icon: '🌲', x: 5, y: 30, size: '4rem' },
      { icon: '🌳', x: 85, y: 25, size: '5rem' },
      { icon: '🍄', x: 75, y: 70, size: '2rem' },
      { icon: '🦋', x: 45, y: 20, size: '1.5rem' },
    ],
  },
  {
    id: 'forest',
    name: '神秘花园',
    description: '美丽的花园中，一颗枯萎的植物等待着被唤醒。让花朵绽放吧！',
    bgFrom: 'from-sky-400',
    bgTo: 'to-cyan-600',
    explorePoints: [
      { id: 'e1', x: 12, y: 55, cardId: 'water', collected: false, icon: '💧', name: '水滴' },
      { id: 'e2', x: 28, y: 40, cardId: 'seed', collected: false, icon: '🌰', name: '种子' },
      { id: 'e3', x: 50, y: 25, cardId: 'bottle', collected: false, icon: '🫙', name: '空瓶' },
      { id: 'e4', x: 80, y: 30, cardId: 'wind', collected: false, icon: '💨', name: '风' },
      { id: 'e5', x: 60, y: 65, cardId: 'water', collected: false, icon: '💧', name: '水滴' },
    ],
    puzzles: [
      {
        id: 'p1',
        name: '枯萎的花盆',
        x: 70,
        y: 40,
        requiredCardId: 'flower',
        solved: false,
        description: '花盆里的植物需要被照顾，让它开出美丽的花朵',
        solvedIcon: '🌸',
        unsolvedIcon: '🪴',
      },
    ],
    goalPuzzle: 'p1',
    decorations: [
      { icon: '🌻', x: 8, y: 30, size: '3rem' },
      { icon: '🌷', x: 88, y: 55, size: '2.5rem' },
      { icon: '🌿', x: 60, y: 65, size: '2rem' },
      { icon: '🐝', x: 40, y: 30, size: '1.5rem' },
    ],
  },
  {
    id: 'cave',
    name: '幽暗洞穴',
    description: '洞穴深处藏着一个宝箱，需要找到正确的工具来打开它。',
    bgFrom: 'from-slate-600',
    bgTo: 'to-gray-800',
    explorePoints: [
      { id: 'e1', x: 18, y: 50, cardId: 'stone', collected: false, icon: '🪨', name: '石块' },
      { id: 'e2', x: 35, y: 35, cardId: 'branch', collected: false, icon: '🪵', name: '树枝' },
      { id: 'e3', x: 55, y: 60, cardId: 'fire', collected: false, icon: '🔥', name: '火焰' },
      { id: 'e4', x: 75, y: 25, cardId: 'cloud', collected: false, icon: '☁️', name: '乌云' },
    ],
    puzzles: [
      {
        id: 'p1',
        name: '上锁的宝箱',
        x: 75,
        y: 38,
        requiredCardId: 'crowbar',
        solved: false,
        description: '宝箱被锁住了，需要找到工具撬开',
        solvedIcon: '💎',
        unsolvedIcon: '📦',
      },
    ],
    goalPuzzle: 'p1',
    decorations: [
      { icon: '🦇', x: 10, y: 20, size: '2rem' },
      { icon: '🕯️', x: 45, y: 70, size: '2rem' },
      { icon: '💀', x: 85, y: 58, size: '2rem' },
      { icon: '🕸️', x: 25, y: 25, size: '2.5rem' },
    ],
  },
  {
    id: 'library',
    name: '古老图书馆',
    description: '在尘封的图书馆中，需要收集星光来点亮魔法书。',
    bgFrom: 'from-amber-500',
    bgTo: 'to-orange-700',
    explorePoints: [
      { id: 'e1', x: 15, y: 45, cardId: 'water', collected: false, icon: '💧', name: '水滴' },
      { id: 'e2', x: 35, y: 58, cardId: 'seed', collected: false, icon: '🌰', name: '种子' },
      { id: 'e3', x: 55, y: 35, cardId: 'bottle', collected: false, icon: '🫙', name: '空瓶' },
      { id: 'e4', x: 70, y: 65, cardId: 'water', collected: false, icon: '💧', name: '水滴' },
      { id: 'e5', x: 85, y: 25, cardId: 'key', collected: false, icon: '🔑', name: '钥匙' },
    ],
    puzzles: [
      {
        id: 'p1',
        name: '覆盖灰尘的魔法书',
        x: 75,
        y: 43,
        requiredCardId: 'star',
        solved: false,
        description: '魔法书需要星光才能激活',
        solvedIcon: '📖',
        unsolvedIcon: '📕',
      },
      {
        id: 'p2',
        name: '上锁的宝箱',
        x: 20,
        y: 65,
        requiredCardId: 'key',
        solved: false,
        description: '宝箱被锁住了，需要钥匙才能打开',
        solvedIcon: '💎',
        unsolvedIcon: '📦',
      },
    ],
    goalPuzzle: 'p1',
    decorations: [
      { icon: '📚', x: 8, y: 25, size: '4rem' },
      { icon: '🪶', x: 90, y: 60, size: '2rem' },
      { icon: '🕯️', x: 45, y: 20, size: '2rem' },
      { icon: '🦉', x: 85, y: 30, size: '1.5rem' },
    ],
  },
  {
    id: 'final',
    name: '星之圣所',
    description: '最终的圣所！点燃所有元素，见证魔法的奇迹！',
    bgFrom: 'from-indigo-600',
    bgTo: 'to-blue-900',
    explorePoints: [
      { id: 'e1', x: 12, y: 50, cardId: 'fire', collected: false, icon: '🔥', name: '火焰' },
      { id: 'e2', x: 28, y: 35, cardId: 'stone', collected: false, icon: '🪨', name: '石块' },
    ],
    puzzles: [
      {
        id: 'p1',
        name: '元素祭坛',
        x: 65,
        y: 40,
        requiredCardId: 'gem',
        solved: false,
        description: '将火与石融合，创造出奇迹宝石！',
        solvedIcon: '💠',
        unsolvedIcon: '🏛️',
      },
    ],
    goalPuzzle: 'p1',
    decorations: [
      { icon: '✨', x: 5, y: 20, size: '2rem' },
      { icon: '⭐', x: 90, y: 25, size: '2.5rem' },
      { icon: '🌟', x: 50, y: 15, size: '3rem' },
      { icon: '💫', x: 80, y: 65, size: '1.5rem' },
      { icon: '✨', x: 20, y: 70, size: '1.5rem' },
    ],
  },
];

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(createScenes);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [inventory, setInventory] = useState<Card[]>([]);
  const [fusionCircles, setFusionCircles] = useState<Card[]>([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [fusionAnimation, setFusionAnimation] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [newCardAnimation, setNewCardAnimation] = useState<Card | null>(null);

  const currentScene = scenes[currentSceneIndex];

  // 显示消息
  const displayMessage = useCallback((msg: string, duration: number = 2000) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), duration);
  }, []);

  // 收集卡牌
  const collectCard = useCallback((pointId: string) => {
    const scene = scenes[currentSceneIndex];
    const point = scene.explorePoints.find(p => p.id === pointId);
    
    if (point && !point.collected) {
      // 更新场景状态
      setScenes(prev => {
        const newScenes = [...prev];
        const updatedScene = { ...newScenes[currentSceneIndex] };
        const updatedPoints = [...updatedScene.explorePoints];
        const pointIndex = updatedPoints.findIndex(p => p.id === pointId);
        
        if (pointIndex !== -1) {
          updatedPoints[pointIndex] = { ...updatedPoints[pointIndex], collected: true };
          updatedScene.explorePoints = updatedPoints;
          newScenes[currentSceneIndex] = updatedScene;
        }
        
        return newScenes;
      });
      
      // 添加卡牌到背包
      const card = ALL_CARDS[point.cardId];
      setInventory(prev => [...prev, card]);
      setNewCardAnimation(card);
      setTimeout(() => setNewCardAnimation(null), 800);
      displayMessage(`✨ 获得卡牌：${card.icon} ${card.name}！`);
    }
  }, [scenes, currentSceneIndex, displayMessage]);

  // 放入融合法阵
  const addToFusion = useCallback((card: Card) => {
    // 从背包中移除卡牌
    setInventory(prev => {
      const newInventory = [...prev];
      const idx = newInventory.findIndex(c => c.id === card.id);
      if (idx !== -1) newInventory.splice(idx, 1);
      return newInventory;
    });
    // 添加到融合法阵
    setFusionCircles(prev => [...prev, card]);
  }, []);

  // 从融合法阵移除
  const removeFromFusion = useCallback((circleIndex: number) => {
    setFusionCircles(prev => {
      const newCircles = [...prev];
      const removedCard = newCircles.splice(circleIndex, 1)[0];
      // 将卡牌放回背包
      if (removedCard) {
        setInventory(prev => [...prev, removedCard]);
      }
      return newCircles;
    });
  }, []);

  // 尝试融合
  const tryFuse = useCallback(() => {
    if (fusionCircles.length < 2) {
      displayMessage('❌ 需要放入至少两张卡牌才能融合！');
      return;
    }

    setFusionAnimation(true);
    
    setTimeout(() => {
      // 尝试所有可能的两张卡牌组合
      let foundRecipe = null;
      let usedCards = [];
      for (let i = 0; i < fusionCircles.length; i++) {
        for (let j = i + 1; j < fusionCircles.length; j++) {
          const card1 = fusionCircles[i];
          const card2 = fusionCircles[j];
          const recipe = RECIPES.find(
            r => r.ingredients.includes(card1.id) && r.ingredients.includes(card2.id)
          );
          if (recipe) {
            foundRecipe = recipe;
            usedCards = [card1, card2];
            break;
          }
        }
        if (foundRecipe) break;
      }

      if (foundRecipe) {
        const resultCard = ALL_CARDS[foundRecipe.result];
        // 将融合结果添加到背包
        setInventory(prev => [...prev, resultCard]);
        setFusionCircles([]);
        setNewCardAnimation(resultCard);
        setTimeout(() => setNewCardAnimation(null), 800);
        displayMessage(`🎉 融合成功！获得：${resultCard.icon} ${resultCard.name}！`);
      } else {
        // 将卡牌放回背包
        fusionCircles.forEach(card => {
          setInventory(prev => [...prev, card]);
        });
        setFusionCircles([]);
        displayMessage('💫 这些卡牌无法融合...');
      }
      setFusionAnimation(false);
    }, 600);
  }, [fusionCircles, displayMessage]);

  // 解决谜题
  const solvePuzzle = useCallback((puzzle: Puzzle) => {
    const hasCard = inventory.find(c => c.id === puzzle.requiredCardId);
    if (hasCard) {
      setScenes(prev => {
        const newScenes = [...prev];
        const scene = { ...newScenes[currentSceneIndex] };
        const puzzles = [...scene.puzzles];
        const puzzleIndex = puzzles.findIndex(p => p.id === puzzle.id);
        
        if (puzzleIndex !== -1) {
          puzzles[puzzleIndex] = { ...puzzles[puzzleIndex], solved: true };
          scene.puzzles = puzzles;
          newScenes[currentSceneIndex] = scene;
        }
        
        return newScenes;
      });
      
      setInventory(prev => {
        const idx = prev.findIndex(c => c.id === puzzle.requiredCardId);
        if (idx !== -1) {
          const newInventory = [...prev];
          newInventory.splice(idx, 1);
          return newInventory;
        }
        return prev;
      });
      
      setSelectedPuzzle(null);
      
      if (puzzle.id === currentScene.goalPuzzle) {
        setTimeout(() => {
          setLevelComplete(true);
          displayMessage('🎊 太棒了！关卡完成！', 3000);
        }, 500);
      } else {
        displayMessage(`🎯 ${puzzle.name} 谜题解决了！`);
      }
    } else {
      setSelectedPuzzle(puzzle);
    }
  }, [currentSceneIndex, currentScene.goalPuzzle, inventory, displayMessage]);

  // 进入下一关
  const nextLevel = useCallback(() => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setFusionCircles([]);
      setSelectedPuzzle(null);
      setLevelComplete(false);
      displayMessage(`🌟 进入新关卡：${scenes[currentSceneIndex + 1].name}`, 2500);
    } else {
      setGameComplete(true);
    }
  }, [currentSceneIndex, scenes, displayMessage]);

  // 重新开始
  const restartGame = useCallback(() => {
    setScenes(createScenes());
    setCurrentSceneIndex(0);
    setInventory([]);
    setFusionCircles([]);
    setSelectedPuzzle(null);
    setLevelComplete(false);
    setGameComplete(false);
    setShowTutorial(true);
  }, []);

  // 拖拽处理
  const handleDragStart = (card: Card) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnFusion = () => {
    if (draggedCard) {
      addToFusion(draggedCard);
    }
    setDraggedCard(null);
  };

  // 点击卡牌放入融合
  const handleCardDoubleClick = (card: Card) => {
    addToFusion(card);
  };

  // 教程确认
  const confirmTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-200 flex flex-col items-center p-4 pb-8">
      {/* 标题 */}
      <h1 className="text-2xl sm:text-4xl font-bold text-amber-800 mb-2 drop-shadow-lg flex items-center gap-2">
        <span>🎴</span>
        <span>卡牌融合工坊</span>
        <span>🎴</span>
      </h1>
      
      {/* 关卡信息 */}
      <div className="bg-white bg-opacity-80 rounded-full px-4 py-1 mb-2 shadow-lg">
        <span className="text-amber-700 font-medium">
          第 {currentSceneIndex + 1} 关 / {scenes.length}：{currentScene.name}
        </span>
      </div>

      {/* 教程弹窗 */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md shadow-2xl border-4 border-amber-300">
            <h2 className="text-2xl font-bold text-amber-700 mb-4 text-center">🎮 游戏教程</h2>
            <div className="space-y-3 text-gray-700 mb-6">
              <p className="flex items-start gap-2">
                <span className="text-xl">1️⃣</span>
                <span>点击场景中<span className="text-amber-600 font-bold animate-pulse">发光的物品</span>收集卡牌</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">2️⃣</span>
                <span>双击卡牌将其放入<span className="text-cyan-600 font-bold">融合法阵</span></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">3️⃣</span>
                <span>放入两张卡牌后，点击<span className="text-pink-600 font-bold">融合按钮</span>尝试组合</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-xl">4️⃣</span>
                <span>点击场景中的<span className="text-rose-600 font-bold">谜题</span>，用正确的卡牌解决</span>
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 mb-4 border-2 border-amber-200">
              <p className="text-sm text-amber-700 text-center">
                💡 提示：水💧 + 种子🌰 = 嫩芽🌱<br/>
                火🔥 + 树枝🪵 = 火炬🔦
              </p>
            </div>
            <button
              onClick={confirmTutorial}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              开始冒险！🚀
            </button>
          </div>
        </div>
      )}

      {/* 游戏完成 */}
      {gameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-amber-100 to-orange-100 rounded-3xl p-8 max-w-md shadow-2xl border-4 border-amber-400 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-amber-700 mb-4">恭喜通关！</h2>
            <p className="text-gray-700 mb-6 text-lg">
              你已成功完成所有关卡！<br/>
              成为了真正的<span className="text-amber-600 font-bold">卡牌融合大师</span>！
            </p>
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-8 rounded-full hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              🔄 重新开始
            </button>
          </div>
        </div>
      )}

      {/* 关卡完成提示 */}
      {levelComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4" onClick={() => nextLevel()}>
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-green-400 text-center animate-bounce">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">太棒了！</h2>
            <p className="text-gray-600 mb-4">点击任意处继续...</p>
          </div>
        </div>
      )}

      {/* 消息提示 */}
      {showMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-30 bg-white shadow-2xl px-6 py-3 rounded-full border-2 border-amber-300 animate-bounce">
          <p className="text-lg font-medium text-gray-800">{message}</p>
        </div>
      )}

      {/* 场景描述栏 */}
      <div className="bg-white bg-opacity-90 rounded-2xl px-4 py-2 mb-3 shadow-lg max-w-lg w-full">
        <p className="text-amber-700 text-center text-sm sm:text-base">
          📜 {currentScene.description}
        </p>
      </div>

      {/* 游戏场景 */}
      <div 
        className={`relative w-full max-w-lg h-56 sm:h-64 rounded-3xl shadow-2xl overflow-hidden border-4 border-white bg-gradient-to-b ${currentScene.bgFrom} ${currentScene.bgTo}`}
      >
        {/* 装饰元素 */}
        {currentScene.decorations.map((dec, idx) => (
          <div
            key={idx}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-70"
            style={{ left: `${dec.x}%`, top: `${dec.y}%`, fontSize: dec.size }}
          >
            {dec.icon}
          </div>
        ))}

        {/* 探索点 */}
        {currentScene.explorePoints.map(point => (
          <button
            key={point.id}
            onClick={() => collectCard(point.id)}
            disabled={point.collected}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white
              ${point.collected ? 'bg-gray-400 opacity-30 cursor-not-allowed border-gray-300' : 'bg-yellow-300 hover:scale-125 cursor-pointer shadow-xl hover:shadow-2xl'}
            `}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {!point.collected && (
              <div className="absolute inset-0 rounded-full bg-yellow-200 animate-ping opacity-50" />
            )}
            <span className="text-2xl relative z-10">{point.icon}</span>
          </button>
        ))}

        {/* 谜题 */}
        {currentScene.puzzles.map(puzzle => (
          <button
            key={puzzle.id}
            onClick={() => solvePuzzle(puzzle)}
            disabled={puzzle.solved}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-4
              ${puzzle.solved ? 'bg-green-300 border-green-100 cursor-default' : 'bg-rose-100 hover:bg-rose-200 cursor-pointer hover:scale-110 border-rose-300 animate-pulse shadow-lg'}
            `}
            style={{ left: `${puzzle.x}%`, top: `${puzzle.y}%` }}
          >
            <span className="text-2xl">{puzzle.solved ? puzzle.solvedIcon : puzzle.unsolvedIcon}</span>
            {!puzzle.solved && (
              <span className="text-xs text-rose-700 font-medium">谜题</span>
            )}
          </button>
        ))}
      </div>

      {/* 谜题详情弹窗 */}
      {selectedPuzzle && (
        <div className="bg-white rounded-2xl p-4 shadow-2xl border-4 border-rose-300 max-w-sm w-full mb-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{selectedPuzzle.unsolvedIcon}</span>
            <div>
              <h3 className="font-bold text-lg text-rose-700">{selectedPuzzle.name}</h3>
              <p className="text-gray-600 text-sm">{selectedPuzzle.description}</p>
            </div>
          </div>
          <p className="text-amber-600 font-medium text-center">
            需要卡牌：{ALL_CARDS[selectedPuzzle.requiredCardId].icon} {ALL_CARDS[selectedPuzzle.requiredCardId].name}
          </p>
          <button
            onClick={() => setSelectedPuzzle(null)}
            className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-full transition-colors font-medium"
          >
            关闭
          </button>
        </div>
      )}

      {/* 融合法阵 */}
      <div className="bg-gradient-to-b from-white to-cyan-50 rounded-3xl p-4 shadow-xl border-4 border-cyan-300 mt-4 max-w-md w-full">
        <h2 className="text-xl font-bold text-cyan-700 text-center mb-3 flex items-center justify-center gap-2">
          <span>✨</span> 融合法阵 <span>✨</span>
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {/* 动态显示融合法阵中的卡牌 */}
          {fusionCircles.map((card, index) => (
            <div
              key={index}
              className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl border-4 border-dashed flex items-center justify-center transition-all duration-300
                border-cyan-400 bg-cyan-100
                ${fusionAnimation ? 'animate-spin' : ''}
              `}
              onClick={() => removeFromFusion(index)}
            >
              <div className="text-center">
                <span className="text-3xl">{card.icon}</span>
                <p className="text-xs text-cyan-700 mt-1">{card.name}</p>
              </div>
            </div>
          ))}
          
          {/* 添加卡牌的区域 */}
          <div
            className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl border-4 border-dashed flex items-center justify-center transition-all duration-300
              border-cyan-300 bg-cyan-50 hover:bg-cyan-100
            `}
            onDragOver={handleDragOver}
            onDrop={handleDropOnFusion}
          >
            <span className="text-3xl text-cyan-300">+</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={tryFuse}
            disabled={fusionCircles.length < 2 || fusionAnimation}
            className={`bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-all
              ${fusionCircles.length >= 2 && !fusionAnimation
                ? 'hover:from-pink-600 hover:to-rose-600 cursor-pointer hover:scale-110 shadow-lg'
                : 'opacity-50 cursor-not-allowed'
              }
            `}
          >
            {fusionAnimation ? '融合中...' : '融合！'}
          </button>
        </div>

        <p className="text-center text-xs text-cyan-500 mt-3">💡 双击卡牌放入法阵，点击法阵中的卡牌移除</p>
      </div>

      {/* 卡牌背包 */}
      <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-4 shadow-xl border-4 border-amber-300 mt-4 max-w-lg w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
            <span>🎒</span> 卡牌背包
          </h2>
          <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
            {inventory.length} 张
          </span>
        </div>

        {inventory.length === 0 ? (
          <p className="text-center text-gray-400 py-6">
            🔍 背包空空如也，去探索收集卡牌吧！
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center min-h-20">
            {inventory.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                draggable
                onDragStart={() => handleDragStart(card)}
                onDoubleClick={() => handleCardDoubleClick(card)}
                className={`bg-gradient-to-b from-amber-100 to-amber-200 w-16 h-20 rounded-xl border-4 border-amber-400 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-200 shadow-lg
                  ${newCardAnimation?.id === card.id ? 'animate-bounce scale-110' : ''}
                `}
                title={`${card.name}: ${card.description}`}
              >
                <span className="text-2xl sm:text-3xl drop-shadow">{card.icon}</span>
                <span className="text-xs sm:text-sm text-amber-800 font-bold">{card.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 融合配方提示 */}
      <div className="bg-white bg-opacity-80 rounded-2xl p-4 shadow-lg mt-4 max-w-lg w-full">
        <h3 className="font-bold text-amber-700 text-center mb-2">📋 融合配方提示</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <p>💧 + 🌰 = 🌱 嫩芽</p>
          <p>🔥 + 🪵 = 🔦 火炬</p>
          <p>💧 + 🫙 = 🍶 水瓶</p>
          <p>🪨 + 🪵 = 🔧 撬棍</p>
          <p>🍶 + 🌱 = 🌸 花朵</p>
          <p>☁️ + 💨 = 🌧️ 雨水</p>
          <p>💧 + 🌸 = ⭐ 星星</p>
          <p>🔥 + 🪨 = 💠 宝石</p>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={restartGame}
          className="bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-full transition-all shadow-lg border-2 border-gray-200 flex items-center gap-2 font-medium"
        >
          <span>🔄</span> 重新开始
        </button>
        <button
          onClick={() => setShowTutorial(true)}
          className="bg-white hover:bg-amber-50 text-amber-700 py-2 px-4 rounded-full transition-all shadow-lg border-2 border-amber-200 flex items-center gap-2 font-medium"
        >
          <span>❓</span> 帮助
        </button>
      </div>

      {/* 页脚 */}
      <p className="text-amber-600 text-sm mt-4">🎴 卡牌融合工坊 - 用智慧创造奇迹 ✨</p>

      {/* 新卡牌动画提示 */}
      {newCardAnimation && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="text-center animate-ping">
            <div className="text-8xl">{newCardAnimation.icon}</div>
            <div className="text-2xl font-bold text-amber-600">{newCardAnimation.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;