// src/components/common/Loader.tsx
import Lottie from "lottie-react";
import loaderAnimation from "@/assets/loader.json";

export default function Loader() {
  return (
    <div className="flex justify-center items-center py-10">
      <Lottie animationData={loaderAnimation} loop autoplay style={{ height: 100, width: 100 }} />
    </div>
  );
}
