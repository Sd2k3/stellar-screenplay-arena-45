import React, { useEffect, useRef, useState } from "react";
import Ship from "./Ship";
import Asteroid from "./Asteroid";
import Token from "./Token";
import { cn } from "@/lib/utils";

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onNameRequired?: (finalScore: number) => void;
  className?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onScoreUpdate,
  onGameOver,
  onNameRequired,
  className,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [shipPosition, setShipPosition] = useState({ x: 0, y: 0 });
  const [shipRotation, setShipRotation] = useState(0);
  const [asteroids, setAsteroids] = useState<Array<{
    id: number;
    position: { x: number; y: number };
    rotation: number;
    size: number;
    type: "small" | "medium" | "large";
    speed: number;
  }>>([]);
  const [tokens, setTokens] = useState<Array<{
    id: number;
    position: { x: number; y: number };
    collected: boolean;
  }>>([]);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastTokenTime = useRef<number>(0);
  const lastAsteroidTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  useEffect(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      setCanvasSize({ width, height });
      setShipPosition({ x: width / 2, y: height - 100 });
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
      if (e.key === " " && !isActive && !gameOver) {
        setIsActive(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isActive, gameOver]);

  const resetGame = () => {
    setShipPosition({ x: canvasSize.width / 2, y: canvasSize.height - 100 });
    setShipRotation(0);
    setAsteroids([]);
    setTokens([]);
    setScore(0);
    setGameOver(false);
    setIsActive(false);
    frameCount.current = 0;
    lastTokenTime.current = 0;
    lastAsteroidTime.current = 0;
  };

  useEffect(() => {
    if (!isActive || gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
      if (keysPressed.current.has("ArrowLeft")) {
        setShipPosition(prev => ({
          ...prev,
          x: Math.max(20, prev.x - 5)
        }));
        setShipRotation(-15);
      } else if (keysPressed.current.has("ArrowRight")) {
        setShipPosition(prev => ({
          ...prev,
          x: Math.min(canvasSize.width - 20, prev.x + 5)
        }));
        setShipRotation(15);
      } else {
        setShipRotation(0);
      }

      if (frameCount.current - lastAsteroidTime.current > 60) {
        lastAsteroidTime.current = frameCount.current;
        
        const newAsteroid: {
          id: number;
          position: { x: number; y: number };
          rotation: number;
          size: number;
          type: "small" | "medium" | "large";
          speed: number;
        } = {
          id: Date.now(),
          position: { 
            x: Math.random() * (canvasSize.width - 60), 
            y: -50 
          },
          rotation: Math.random() * 360,
          size: Math.random() < 0.3 ? 60 : Math.random() < 0.7 ? 40 : 25,
          type: Math.random() < 0.3 ? "large" : Math.random() < 0.7 ? "medium" : "small",
          speed: Math.random() * 2 + 1
        };
        
        setAsteroids(prev => [...prev, newAsteroid]);
      }
      
      if (frameCount.current - lastTokenTime.current > 120) {
        lastTokenTime.current = frameCount.current;
        
        const newToken = {
          id: Date.now(),
          position: { 
            x: Math.random() * (canvasSize.width - 30), 
            y: -30 
          },
          collected: false
        };
        
        setTokens(prev => [...prev, newToken]);
      }

      setAsteroids(prev => 
        prev
          .map(asteroid => ({
            ...asteroid,
            position: {
              ...asteroid.position,
              y: asteroid.position.y + asteroid.speed
            },
            rotation: asteroid.rotation + 0.5
          } as typeof asteroid))
          .filter(asteroid => asteroid.position.y < canvasSize.height + 50)
      );

      setTokens(prev => 
        prev
          .map(token => ({
            ...token,
            position: {
              ...token.position,
              y: token.position.y + 1
            }
          }))
          .filter(token => token.position.y < canvasSize.height + 30)
      );

      const shipRadius = 20;
      
      setTokens(prev => 
        prev.map(token => {
          const dx = token.position.x - shipPosition.x;
          const dy = token.position.y - shipPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (!token.collected && distance < shipRadius + 15) {
            setScore(s => s + 10);
            return { ...token, collected: true };
          }
          return token;
        })
      );
      
      let collision = false;
      asteroids.forEach(asteroid => {
        const dx = asteroid.position.x - shipPosition.x;
        const dy = asteroid.position.y - shipPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < shipRadius + asteroid.size / 2 - 10) {
          collision = true;
        }
      });
      
      if (collision && !gameOver) {
        setGameOver(true);
        setIsActive(false);
        onGameOver(score);
      }
      
      onScoreUpdate(score);
      frameCount.current++;
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isActive, gameOver, canvasSize, shipPosition, asteroids, tokens, score, onScoreUpdate, onGameOver]);

  useEffect(() => {
    if (gameOver) {
      if (onNameRequired) {
        onNameRequired(score);
      } else {
        onGameOver(score);
      }
    }
    // eslint-disable-next-line
  }, [gameOver]);

  return (
    <div 
      ref={canvasRef} 
      className={cn(
        "relative overflow-hidden rounded-lg space-gradient star-field", 
        className
      )}
      style={{ height: "600px", cursor: "default" }}
    >
      <Ship position={shipPosition} rotation={shipRotation} />
      
      {asteroids.map(asteroid => (
        <Asteroid 
          key={asteroid.id}
          position={asteroid.position}
          rotation={asteroid.rotation}
          size={asteroid.size}
          type={asteroid.type}
        />
      ))}
      
      {tokens.map(token => (
        <Token 
          key={token.id}
          position={token.position}
          collected={token.collected}
        />
      ))}
      
      {!isActive && !gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50">
          <h2 className="text-white text-3xl mb-4 font-bold">Stellar Arcade</h2>
          <p className="text-white mb-6">Press SPACE to start</p>
          <p className="text-white text-sm">
            Use LEFT and RIGHT arrow keys to move your ship
          </p>
        </div>
      )}
      
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50">
          <h2 className="text-red-500 text-3xl mb-4">Game Over</h2>
          <p className="text-white text-xl mb-2">Final Score: {score}</p>
          <button
            onClick={resetGame}
            className="mt-6 px-5 py-2.5 bg-space-stellar-blue hover:bg-blue-600 text-white rounded transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
