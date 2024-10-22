import { useEffect, useRef, useState } from "react";
import { Group, Image, Rect, Transformer } from "react-konva";
import useImage from "use-image";

const URLImage = ({ img, canvasWidth, canvasHeight, onDelete }) => {
  const [image, status] = useImage(img);
  const [isSelected, setIsSelected] = useState(false);
  const trRef = useRef();
  const imageRef = useRef();
  const groupRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (status === "loaded") {
      // Calculate the proportional width and height
      const aspectRatio = image.width / image.height;
      const maxWidth = canvasWidth * (3 / 4);
      const maxHeight = canvasHeight * (3 / 4);
      let width = maxWidth;
      let height = maxWidth / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }

      setSize({ width, height });

      // Calculate initial position to center the image
      const x = (canvasWidth - width) / 2;
      const y = (canvasHeight - height) / 2;
      setPosition({ x, y });
    }
  }, [image, canvasWidth, canvasHeight, status]);

  const handleDragStart = () => {
    setIsSelected(true);
  };

  const handleDragEnd = (e) => {
    setIsSelected(false);
    setPosition({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransform = () => {
    const node = imageRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);
    setPosition({ x: node.x(), y: node.y() });

    // Update width and height if needed
    // Assuming you want to handle these attributes internally
    // Adjust this part according to your requirements
    node.width(Math.max(5, node.width() * scaleX));
    node.height(Math.max(node.height() * scaleY));
  };

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Delete" && isSelected) {
        onDelete();
      }
      if (event.key === "Escape" && isSelected) {
        setIsSelected(false);
      }
      if (event.key === "ArrowUp" && isSelected) {
        setPosition((prev) => ({ ...prev, y: prev.y - 5 }));
      }
      if (event.key === "ArrowDown" && isSelected) {
        setPosition((prev) => ({ ...prev, y: prev.y + 5 }));
      }
      if (event.key === "ArrowLeft" && isSelected) {
        setPosition((prev) => ({ ...prev, x: prev.x - 5 }));
      }
      if (event.key === "ArrowRight" && isSelected) {
        setPosition((prev) => ({ ...prev, x: prev.x + 5 }));
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, onDelete]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSelected && !groupRef.current.getStage().clickStartShape) {
        setIsSelected(false);
      }
    };

    const stage = groupRef.current.getStage();
    stage.container().addEventListener("click", handleClickOutside);

    return () => {
      stage.container().removeEventListener("click", handleClickOutside);
    };
  }, [isSelected]);

  return (
    <Group ref={groupRef}>
      <Image
        image={image}
        ref={imageRef}
        x={position.x}
        y={position.y}
        width={size.width}
        height={size.height}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => setIsSelected(!isSelected)}
        onMouseEnter={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage().container();
          container.style.cursor = "default";
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          onTransform={handleTransform}
        />
      )}
      {isSelected && (
        <Rect
          x={position.x + size.width - 20}
          y={position.y - 20}
          width={20}
          height={20}
          fill="red"
          onClick={onDelete}
        />
      )}
    </Group>
  );
};

export default URLImage;
