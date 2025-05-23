//routes/cardId.tsx
import { Link, useLoaderData, useParams } from "react-router";
import type { Route } from "../+types/root";
import { Edit, Trash } from "lucide-react";
import { getCardById } from "~/utils/card-repo";
import { getSession } from "~/utils/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "카드 정보 | SuperCard" },
    {
      name: "description",
      content:
        "이 페이지에서 카드의 제목, 내용, 복습 정보 등을 확인할 수 있습니다.",
    },
  ];
}

// loader 함수
export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request);
    const userId = session.get("userId");
    const id = params.cardId;
  const card = await getCardById(Number(id), userId);
  return card;
}

export default function CardId() {
  const params = useParams();
  const loaderData = useLoaderData();

  let imageUrl = null;
  if (loaderData.image) {
    imageUrl = loaderData.image;
  } else {
    imageUrl = "/uploads/default.jpg";
  }

  const handleDelete = async (cardId: number) => {
    try {
      const confirm = window.confirm("카드를 삭제하겠습니까?");
      if (confirm) {
        const response = await fetch(`/api/card/${cardId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          console.log(`Card with ID ${cardId} deleted`);
        } else {
          console.error("Failed to delete the card");
        }
      }
    } catch (error) {
      console.error("Error occurred while deleting the card:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div
        className="p-6 rounded-lg shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))", // 반투명 그라데이션 배경
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // 부드러운 그림자
        }}
      >
        <h3 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Card Details: {params.cardId}
        </h3>

        {/* 카드 이미지 표시 */}
        <div className="flex justify-center mb-4">
          <img
            src={imageUrl}
            alt="Card Image"
            className="max-w-[500px] max-h-[300px] w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* 카드 정보 */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-200">Title</h4>
            <p className="text-lg text-white">{loaderData.title}</p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-200">Content</h4>
            <p className="text-lg text-white">{loaderData.content}</p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-200">Answer</h4>
            <p className="text-lg text-white">{loaderData.answer}</p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-200">Tier</h4>
            <p className="text-lg text-white">{loaderData.tier}</p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-200">SuperCard</h4>
            <p className="text-lg text-white">
              {loaderData.superCard || "N/A"}
            </p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-200">Next Review</h4>
            <p className="text-lg text-white">
              {loaderData.nextReview || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Link to={`/edit/${params.cardId}`}>
            <button className="flex items-center mr-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <Edit className="w-5 h-5 mr-2" /> 수정하기
            </button>
          </Link>
          <button
            onClick={() => handleDelete(Number(params.cardId))}
            className="flex items-center bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Trash className="w-5 h-5 mr-2" /> 삭제하기
          </button>
        </div>

        {/* 카드 JSON 정보 출력 (디버깅용) */}
        <div className="mt-6">
          <h4 className="text-xl font-semibold text-gray-200">
            Card Data (JSON)
          </h4>
          <pre className="bg-gray-100 p-4 rounded-md text-sm text-gray-600 overflow-x-auto">
            {JSON.stringify(loaderData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}