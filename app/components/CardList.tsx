// components/CardList.tsx
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import clsx from "clsx";
import {
  CheckCircle,
  CheckSquare,
  Edit,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  StickyNote,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { Link } from "react-router";
import type { Card } from "@prisma/client";
import NewCardFloatingButton from "./NewCardFloatingButton";
import { generateReviewUpdate } from "~/utils/reviewLogic";

const PAGE_LIMIT = 10;

const getTypeBadge = (type?: string | null) => {
  const baseStyle =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold";

  switch (type?.toLowerCase()) {
    case "task":
      return (
        <span className={`${baseStyle} bg-purple-100 text-purple-800`}>
          <CheckSquare className="w-4 h-4" />
          Task
        </span>
      );
    case "quiz":
      return (
        <span className={`${baseStyle} bg-blue-100 text-blue-800`}>
          <HelpCircle className="w-4 h-4" />
          Quiz
        </span>
      );
    case "memo":
      return (
        <span className={`${baseStyle} bg-yellow-100 text-yellow-800`}>
          <StickyNote className="w-4 h-4" />
          Memo
        </span>
      );
    case "tip":
      return (
        <span className={`${baseStyle} bg-green-100 text-green-800`}>
          <Info className="w-4 h-4" />
          Tip
        </span>
      );
    default:
      return (
        <span className={`${baseStyle} bg-gray-200 text-gray-800`}>
          <FileText className="w-4 h-4" />
          Unknown
        </span>
      );
  }
};

export default function CardList({
  fetchUrl,
}: {
  fetchUrl: (page: number) => string;
}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [success, setSuccess] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");

  const fetchCards = async (pageToFetch: number) => {
    try {
      const res = await fetch(fetchUrl(pageToFetch));
      const newCards: Card[] = await res.json();

      setCards((prev) => {
        const ids = new Set(prev.map((c) => c.id));
        const unique = newCards.filter((c) => !ids.has(c.id));
        return [...prev, ...unique];
      });

      if (newCards.length < PAGE_LIMIT) setHasMore(false);
    } catch (err) {
      console.error("카드 불러오기 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(1);
  }, []);

  useEffect(() => {
    if (page === 1) return;
    fetchCards(page);
  }, [page]);

  const handleDelete = async (cardId: number) => {
    const confirmDelete = window.confirm("카드를 삭제하겠습니까?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/card/${cardId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCards((prev) => prev.filter((card) => card.id !== cardId));
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  const toggleSuccessFailure = (cardId: number) => {
    setSuccess((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleComplete = async (cardId: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const formData = generateReviewUpdate({
      card: {
        id: card.id,
        intervalDays: card.intervalDays,
        box: card.box ?? 1,
        reviewCount: card.reviewCount,
      },
      success: success[cardId],
    });

    try {
      const response = await fetch(`/api/card/${cardId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        console.log(`🎉 Card ${cardId} updated successfully!`);
      } else {
        const errorData = await response.json();
        console.error(`❌ Failed to update card ${cardId}:`, errorData);
      }
    } catch (error) {
      console.error("🚨 Error updating card:", error);
    }
  };

  const filteredCards = cards.filter((card) => {
    const matchQuery = card.title.toLowerCase().includes(query.toLowerCase());
    const matchType =
      selectedType === "all"
        ? true
        : (card.type?.toLowerCase() || "unknown") === selectedType;
    return matchQuery && matchType;
  });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Showing {filteredCards.length} of {cards.length} Cards
        </h2>
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["all", "task", "quiz", "memo", "tip", "unknown"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={clsx(
              "px-3 py-1 rounded-full border text-sm capitalize transition",
              selectedType === type
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-16 text-gray-500">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <InfiniteScroll
          scrollThreshold={1}
          dataLength={filteredCards.length}
          next={() => setPage((prev) => prev + 1)}
          hasMore={hasMore}
          loader={<h4 className="text-center mt-4">Loading more cards...</h4>}
        >
          <div className="grid grid-cols-1 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
                style={{
                  ...(card.image
                    ? {
                        backgroundImage: `url(${card.image})`,
                        backgroundBlendMode: "multiply",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                      }
                    : { backgroundColor: "rgba(0, 0, 0, 0.6)" }),
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <h3 className="text-xl font-semibold text-white flex justify-between">
                  <Link to={`/card/${card.id}`}>{card.title}</Link>
                  {getTypeBadge(card.type)}
                </h3>
                <p className="text-white mt-2">{card.content}</p>
                <div className="text-xs mt-2 text-white">
                  Tier: {card.tier} / Box: {card.box} / Count:{" "}
                  {card.reviewCount}
                </div>
                <div className="text-xs text-white">
                  Last: {new Date(card.lastReviewAt).toLocaleDateString()} /
                  Next: {new Date(card.nextReviewAt).toLocaleDateString()}
                </div>
                <div className="mt-4 flex justify-end space-x-4">
                  <Link to={`/edit/${card.id}`}>
                    <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition">
                      <Edit className="w-5 h-5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleSuccessFailure(card.id)}
                    className={clsx("text-white p-2 rounded-md", {
                      "bg-yellow-500 hover:bg-yellow-600 transition":
                        success[card.id],
                      "bg-gray-500 hover:bg-gray-600 transition":
                        !success[card.id],
                    })}
                  >
                    {success[card.id] ? <ThumbsUp /> : <ThumbsDown />}
                  </button>
                  <button
                    onClick={() => handleComplete(card.id)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      )}
      <NewCardFloatingButton />
    </div>
  );
}
