import clsx from "clsx";
import {
  CheckCircle,
  Edit,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router";
import type { Route } from "../+types/root";
import NewCardFloatingButton from "~/components/NewCardFloatingButton";
import type { Card } from "@prisma/client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Today's Cards | SuperCard" },
    {
      name: "description",
      content: "지금까지 만든 모든 학습 카드를 확인하고 관리하세요.",
    },
  ];
}

// type CardWithId = Card & { id: number };
type CardWithId = Card;

const PAGE_LIMIT = 10;

export default function CardPage() {
  const [cards, setCards] = useState<CardWithId[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [success, setSuccess] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCards = async (pageToFetch: number) => {
    try {
      const res = await fetch(
        `/api/cards?page=${pageToFetch}&limit=${PAGE_LIMIT}&today=true`
      );
      const newCards: CardWithId[] = await res.json();

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
    // 최초 로딩용
    fetchCards(1);
  }, []);

  useEffect(() => {
    if (page === 1) return; // 페이지 1은 이미 로딩됨
    fetchCards(page);
  }, [page]);

  const handleDelete = async (cardId: number) => {
    try {
      const confirmDelete = window.confirm("카드를 삭제하겠습니까?");
      if (!confirmDelete) return;

      const response = await fetch(`/api/card/${cardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCards((prev) => prev.filter((card) => card.id !== cardId));
        console.log(`Card with ID ${cardId} deleted`);
      } else {
        console.error("Failed to delete the card");
      }
    } catch (error) {
      console.error("Error occurred while deleting the card:", error);
    }
  };

  const toggleSuccessFailure = (cardId: number) => {
    setSuccess((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleComplete = async (cardId: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const today = new Date().toISOString().split("T")[0];
    const updatedReviewCount = card.reviewCount + 1;
    const currentBox = card.box ?? 1;
    const updatedBox = success[cardId]
      ? currentBox + 1
      : Math.max(1, currentBox - 1);
    const updatedInterval = success[cardId]
      ? card.intervalDays + 1
      : Math.max(1, card.intervalDays - 1);
    const updatedNextReview = new Date();
    updatedNextReview.setDate(updatedNextReview.getDate() + updatedInterval);

    const formData = new FormData();
    formData.append("box", String(updatedBox));
    formData.append("reviewInterval", String(updatedInterval));
    formData.append(
      "nextReview",
      updatedNextReview.toISOString().split("T")[0]
    );
    formData.append("lastReview", today);
    formData.append("reviewCount", String(updatedReviewCount));

    try {
      const response = await fetch(`/api/card/${cardId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? { ...card, ...Object.fromEntries(formData.entries()) }
              : c
          )
        );
        console.log(`Card ${cardId} updated successfully!`);
      } else {
        const errorData = await response.json();
        console.error(`Failed to update card ${cardId}:`, errorData);
      }
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const filteredCards = cards.filter((card) =>
    card.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        {!isLoading && (
          <h2 className="text-2xl font-bold mb-4">
            There are totally {cards.length} Cards.
          </h2>
        )}
        <input
          type="text"
          placeholder="Search cards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center mt-16 text-gray-500">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center mt-8 text-gray-400">
          표시할 카드가 없습니다.
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
            {filteredCards.map((card, index) => (
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
                    : {
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                      }),
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  opacity: 0.9,
                }}
              >
                <Link to={`/card/${card.id}`}>
                  <h3 className="text-xl font-semibold text-white">
                    {index + 1}. {card.title}
                  </h3>
                </Link>
                <p className="text-white mt-2">{card.content}</p>

                <div className="text-xs mt-4 text-white">
                  Tier: {card.tier} / Box: {card.box} / Count:{" "}
                  {card.reviewCount}
                </div>
                <div className="text-xs mt-2 text-white">
                  Last: {card.lastReviewAt.toLocaleString()} / Next: {card.nextReviewAt.toLocaleString()}
                </div>

                <div className="mt-4 flex justify-end space-x-4">
                  <Link to={`/edit/${card.id}`}>
                    <button
                      className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
                      title="Update"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition"
                    title="Delete"
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
                    title="Toggle Success/Failure"
                  >
                    {success[card.id] ? <ThumbsUp /> : <ThumbsDown />}
                  </button>
                  <button
                    onClick={() => handleComplete(card.id)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
                    title="Complete"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      )}

      {!hasMore && !isLoading && (
        <div className="text-center mt-6 text-gray-500 text-sm">
          모든 카드를 다 불러왔습니다!
        </div>
      )}

      <NewCardFloatingButton />
    </div>
  );
}