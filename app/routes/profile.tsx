// src/pages/EditProfile.tsx
import { useState, useRef } from "react";
import { Form, redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import prisma from "~/utils/db.server";
import { saveProfileImage } from "~/utils/profile-repo";
import { getSession } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return redirect("/login");
  }

  return { id: user.id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const bio = (formData.get("bio") as string)?.slice(0, 300);
  const removeAvatar = formData.get("removeAvatar") === "true";
  const avatarFile = formData.get("avatar") as File;

  let avatarUrl = null;
  if (!removeAvatar && avatarFile && avatarFile.size > 0) {
    avatarUrl = await saveProfileImage(avatarFile);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, bio, avatarUrl: removeAvatar ? null : avatarUrl },
  });

  return redirect("/profile");
};

export default function EditProfile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = useLoaderData<typeof loader>();
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  });
  const [previewUrl, setPreviewUrl] = useState(user.avatarUrl ?? "");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setRemoveAvatar(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className="max-w-2xl mx-auto p-8 rounded-xl shadow-xl min-w-xl min-h-[calc(100vh-300px)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2 className="text-3xl font-semibold text-center text-white mb-6">
        Edit Profile
      </h2>
      <Form method="post" encType="multipart/form-data" className="space-y-6">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="removeAvatar" value={String(removeAvatar)} />

        <div className="flex flex-col items-center gap-2">
          <div
            onClick={handleImageClick}
            className="relative w-32 h-32 rounded-full bg-gray-600 cursor-pointer flex items-center justify-center text-white shadow-lg overflow-hidden"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">👤</span>
            )}
            <input
              type="file"
              name="avatar"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition"
              title="Remove photo"
            >
              ✕
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Name</label>
          <input
            type="text"
            name="name"
            value={profile.name ?? ""}
            onChange={handleChange}
            required
            className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            required
            className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Bio</label>
          <textarea
            name="bio"
            rows={4}
            maxLength={300}
            value={profile.bio ?? ""}
            onChange={handleChange}
            placeholder="자기소개를 입력하세요. (최대 300자)"
            className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md text-white"
          />
          <div className="text-right text-sm text-gray-400">
            {(profile.bio ?? "").length}/300
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
          >
            Save Profile
          </button>
        </div>
      </Form>
    </div>
  );
}
