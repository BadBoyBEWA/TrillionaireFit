// app/api/upload/cloudinary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = "uploads"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `trillionaire-fit/${folder}`,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) reject(new Error(error.message));
        else if (result) resolve(result.secure_url);
        else reject(new Error("No result from Cloudinary"));
      }
    );
    stream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // ✅ grab ALL files with key "file"
    const files = formData.getAll("file") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // ✅ upload all files concurrently
    const urls = await Promise.all(
      files.map(async (f) => {
        const buffer = Buffer.from(await f.arrayBuffer());
        return uploadBufferToCloudinary(buffer, "uploads");
      })
    );

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Upload error" },
      { status: 500 }
    );
  }
}
