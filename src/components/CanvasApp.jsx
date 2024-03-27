import imglyRemoveBackground, { preload } from "@imgly/background-removal";
import { useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import URLImage from "./URLImage";

const CanvasApp = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const originalImageUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    setLoading(true); // Set loading to true while processing

    reader.onload = async () => {
      try {
        // Preload assets for better performance
        await preload();

        // Remove background from the uploaded image
        const blob = await imglyRemoveBackground(originalImageUrl, {
          model: "small",
          output: { format: "image/png", type: "mask" },
        });
        const bgRemovedImageUrl = URL.createObjectURL(blob);

        setUploadedImage(bgRemovedImageUrl);
      } catch (error) {
        console.error("Error while processing image:", error);
      } finally {
        setLoading(false);
        console.log("Resetting file input");
        fileInputRef.current.value = "";
        console.log("Resetting file input");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="py-5">
      <input type="file" onChange={handleImageUpload} ref={fileInputRef}/>
      {loading && (
        <div className="w-[700px]  h-[400px] animate-pulse mx-auto mt-5">
          <div className="w-full h-full bg-gray-500 rounded-md flex justify-center align-middle">
            Image Processing running.....
          </div>
        </div>
      )}
      {!loading && (
        <Stage
          width={700}
          height={400}
          style={{ border: "1px solid black", width: "700px", margin: "auto" }}
        >
          <Layer>
            {uploadedImage && (
              <URLImage
                img={uploadedImage}
                canvasWidth={700}
                canvasHeight={400}
                onDelete={handleDeleteImage}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default CanvasApp;
