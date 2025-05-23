//app/utils/profile-repo.ts
import path from "path";
import fs from "fs";

export const saveProfileImage = async (file: File): Promise<string> => {
  const uploadDir = path.join(process.cwd(), "public","profile","uploads",);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));

  return `/profile/uploads/${filename}`;
};