import imglyRemoveBackground, { preload } from "@imgly/background-removal";
import { useState } from "react";
import { Layer, Stage } from "react-konva";
import URLImage from "./URLImage";

const CanvasApp = () => {
  const [uploadedImage, setUploadedImage] = useState(null); // Specify string | null as the state type
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; // Use optional chaining to check if e.target.files exists
    if (file) {
      //   const originalImageUrl = URL.createObjectURL(file);
      const reader = new FileReader();

      setLoading(true); // Set loading to true while processing

      reader.onload = async () => {
        try {
          // Preload assets for better performance
          await preload();

          // Read the file data as data URL
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Error while processing image:", error);
          setLoading(false); // Set loading to false if an error occurs
        }
      };

      reader.onloadend = async () => {
        try {
          // Remove background from the uploaded image
          const blob = await imglyRemoveBackground(reader.result, {
            model: "small",
            output: { format: "image/png" },
          });
          const bgRemovedImageUrl = URL.createObjectURL(blob);

          setUploadedImage(bgRemovedImageUrl);
        } catch (error) {
          console.error("Error while processing image:", error);
        } finally {
          setLoading(false); // Set loading to false when processing is done
        }
      };
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageUpload} />
      {/* {loading && <div>Loading...</div>} */}
      {loading && (
        <div className="w-[700px] mx-auto mt-5 h-[400px] animate-pulse">
          <div className="w-full h-full bg-gray-500 rounded-md flex justify-center items-center">
            Image is Processing...
          </div>
        </div>
      )}
      {!loading && (
        <Stage
          width={700}
          height={400}
          style={{
            border: "1px solid black",
            width: "700px",
            margin: "auto",
            marginTop: "20px",
          }}
        >
          <Layer>
            {uploadedImage && (
              <URLImage
                img={uploadedImage}
                canvasWidth={700}
                canvasHeight={400}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default CanvasApp;
