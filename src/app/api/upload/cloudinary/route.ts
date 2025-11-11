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

    // Handle single file upload (for individual requests)
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Upload single file
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBufferToCloudinary(buffer, "uploads");

    return NextResponse.json({ success: true, url }); // Return single URL
  } catch (error: any) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Upload error" },
      { status: 500 }
    );
  }
}