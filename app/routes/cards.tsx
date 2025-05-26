//app/routes/cards.tsx
import { useState } from "react";
import { useLoaderData } from "react-router";
import { Trash, CheckCircle, ThumbsUp, ThumbsDown, Edit } from "lucide-react";
import { Link } from "react-router";
import clsx from "clsx";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getSession, getUser } from "~/utils/session.server";
import type { Route } from "../+types/root";
import NewCardFloatingButton from "~/components/NewCardFloatingButton";
import type { Card } from "@prisma/client";
import { getCardsAll } from "~/utils/card-repo";
import { generateReviewUpdate } from "~/utils/reviewLogic";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cards | SuperCard" },
    {
      name: "description",
      content: "지금까지 만든 모든 학습 카드를 확인하고 관리하세요.",
    },
  ];
}

// loader 함수에서 카드 데이터를 불러옴
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/login");
  }

  const user = await getUser(request);

  const cards = await getCardsAll(userId);
  return { user, cards };
};

export default function Page() {
  const data = useLoaderData();
  const cards = data.cards;

  const [cardList, setCardList] = useState(cards); // 카드 목록 상태 관리
  const [success, setSuccess] = useState<{ [key: number]: boolean }>({});

  // 삭제 버튼 클릭 시 호출되는 함수
  const handleDelete = async (cardId: number) => {
    try {
      const confirm = window.confirm("카드를 삭제하겠습니까?");
      if (confirm) {
        const response = await fetch(`/api/card/${cardId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          console.log(`Card with ID ${cardId} deleted`);
          setCardList((prevList: Card[]) =>
            prevList.filter((card) => card.id !== cardId)
          );
        } else {
          console.error("Failed to delete the card");
        }
      }
    } catch (error) {
      console.error("Error occurred while deleting the card:", error);
    }
  };

  // 성공/실패 토글 버튼 클릭 시 호출되는 함수
  const toggleSuccessFailure = (cardId: number) => {
    // console.log('hello This is future ToggleBtn')
    setSuccess((pre) => ({ ...pre, [cardId]: !pre[cardId] }));
    // console.log(success);
  };

  // 완료 버튼 클릭 시 호출되는 함수
  const handleComplete = async (cardId: number) => {
    const card = cardList.find((c: Card & { id: number }) => c.id === cardId);
    if (!card) return;

    const formData = generateReviewUpdate({
      card: {
        id: card.id,
        intervalDays: card.intervalDays,
        box: card.box,
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

        // ✅ UI 업데이트
        setCardList((prevList: typeof cardList) =>
          prevList.map((c: Card & { id: number }) =>
            c.id === cardId
              ? { ...card, ...Object.fromEntries(formData.entries()) }
              : c
          )
        );
      } else {
        const errorData = await response.json();
        console.error(`❌ Failed to update card ${cardId}:`, errorData);
      }
    } catch (error) {
      console.error("🚨 Error updating card:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">
        There are totally {cardList.length} Cards.
      </h2>
      {cardList.length === 0 ? (
        <p className="text-gray-600">
          No cards available at the moment. Please add some cards!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardList.map((card: Card & { id: number }) => (
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
                  {card.title}
                </h3>
              </Link>
              <p className="text-white mt-2">{card.content}</p>
              <p className={clsx("text-white mt-2", { hidden: true })}>
                {card.answer}
              </p>
              <p className="text-white mt-2">Author: {data.user.name}</p>

              {/* 날짜 정보 영역 */}
              <div className="mt-4">
                <div className="mt-2 text-sm text-white">
                  <p>
                    Last Review:{" "}
                    {new Date(card.lastReviewAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="mt-2 text-sm text-white">
                  <p>
                    Next Review:{" "}
                    {new Date(card.nextReviewAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>

              {/* 부가정보 영역 */}
              <div className="mt-4 flex">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                  Tier: {card.tier}
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                  Box: {card.box}
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                  Count: {card.reviewCount}
                </span>
              </div>

              {/* 버튼 영역 */}
              <div className="mt-4 flex justify-end space-x-4">
                {/* 수정 버튼 */}
                <button
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
                  title="update"
                >
                  <Link to={`/edit/${card.id}`}>
                    <Edit className="w-5 h-5" />
                  </Link>
                </button>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDelete(card.id)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition"
                  title="Delete"
                >
                  <Trash className="w-5 h-5" />
                </button>
                {/* 성공/실패 토글 버튼 */}
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
                {/* 완료 버튼 */}
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
      )}
      <NewCardFloatingButton />
    </div>
  );
}
