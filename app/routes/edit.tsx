import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import type { Route } from "../+types/root";
import { getCardById } from "~/utils/card-repo";
import { getSession, getUser } from "~/utils/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "카드 수정 | SuperCard" },
    {
      name: "description",
      content: "선택한 학습 카드를 수정하고 필요한 정보를 업데이트하세요.",
    },
  ];
}
// loader 함수에서 카드 데이터를 불러옴
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const userId = session.get("userId");
  const id = params.cardId;

  if (!userId) {
    return redirect("/login");
  }

  const user = await getUser(request);

  const card = await getCardById(Number(id), userId);
  return { user, card };
};

export default function Edit() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadedCard = useLoaderData();

  if (!loadedCard) {
    return <div>Loading...</div>;
  }

  if (typeof window !== "undefined" && !loadedCard) {
    console.warn("loadedCard is undefined on client");
  }

  // console.log("loadedCard is : ", loadedCard);
  const { id, title, content, tier, answer, superCard, image, type } =
    loadedCard.card;

  const [card, setCard] = useState({
    id,
    title,
    content,
    tier,
    answer,
    superCard,
    image,
    type,
  });

  // useEffect(() => setCard(loadedCard), []);

  const [isShow, setShow] = useState(false);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;

    if (
      type === "file" &&
      event.target instanceof HTMLInputElement &&
      event.target.files
    ) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCard((prevCard) => ({
            ...prevCard,
            [name]: reader.result, // 이미지 미리보기 URL 저장
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setCard((prevCard) => ({
        ...prevCard,
        [name]: value === "" ? null : value,
      }));
    }
    console.log(name, ":", value);
  };

  const handleOkBtn = (e: React.FormEvent) => {
    e.preventDefault();
    setShow(!isShow);
  };

  const handleRemoveImage = () => {
    setCard((prevCard) => ({
      ...prevCard,
      image: null, // 이미지 삭제
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto p-8 rounded-xl shadow-xl min-w-xl min-h-[calc(100vh-300px)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))", // 반투명 그라데이션 배경
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // 부드러운 그림자
      }}
    >
      <h2 className="text-3xl font-semibold text-center text-white mb-6">
        Modify Card: {JSON.stringify(loadedCard.id)}
      </h2>
      <Form
        action={`/api/card/${card.id}`}
        method="put"
        encType="multipart/form-data"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white">Type</label>
            <select
              name="type"
              value={card.type ?? ""}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md text-gray-400"
            >
              <option value="">-- Select Card Type--</option>
              <option value="Task">Task</option>
              <option value="Quiz">Quiz</option>
              <option value="Memo">Memo</option>
              <option value="Tip">Tip</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={card.title}
              required
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out text-white "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Content
            </label>
            <textarea
              name="content"
              rows={4}
              value={card.content}
              required
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out text-white "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Tier</label>
            <input
              type="number"
              name="tier"
              value={card.tier}
              onChange={handleChange}
              min="1"
              step="1"
              required
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out text-white "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Answer
            </label>
            <input
              type="text"
              name="answer"
              value={card.answer}
              onChange={handleChange}
              placeholder="(optional...)"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out text-white"
            />
          </div>

          <div className={clsx("", { hidden: card.tier === 1 })}>
            <label className="block text-sm font-medium text-white">
              SuperCard
            </label>
            <input
              type="text"
              name="superCard"
              value={String(card.superCard ?? "")}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out text-white "
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="image" className="font-medium text-gray-700">
              Image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="file:border file:border-gray-300 file:rounded-lg file:px-4 file:py-2 file:text-sm file:text-gray-700 file:cursor-pointer hover:file:bg-blue-50 hover:file:text-blue-700 focus:file:ring-2 focus:file:ring-blue-500"
              onChange={handleChange}
              ref={fileInputRef}
            />
          </div>

          {card.image && (
            <div className="mt-4 relative">
              <img
                src={card.image}
                alt="Uploaded Preview"
                className="w-full h-auto rounded-lg shadow"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          )}

          <div className="flex flex-col">
            <button
              onClick={handleOkBtn}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isShow ? "Hide" : "Preview"}
            </button>

            <div
              className={clsx("mt-4 mb-4 p-2 border rounded-md bg-gray-100", {
                hidden: !isShow,
              })}
            >
              {isShow && (
                <div>
                  {
                    <pre>
                      <h3>카드 생성 정보</h3>
                      <div> -Type:{card.type && `${card.type}`}</div>
                      <div> -Title:{card.title && `${card.title}`}</div>
                      <div> -Content:{card.content && `${card.content}`}</div>
                      <div> -Tier:{card.tier && `${card.tier}`}</div>
                      <div> -Answer:{card.answer && `${card.answer}`}</div>
                      <div> -Image:{card.image && `Attached!`}</div>
                    </pre>
                  }
                </div>
              )}
            </div>

            <button
              type="submit"
              className={clsx(
                "px-4 py-2 border-gray-300 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
                { hidden: !isShow }
              )}
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
