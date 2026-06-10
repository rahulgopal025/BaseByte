import React from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = "100%", height = "20px", rounded = false }) => (
  <div
    className={`bg-zinc-800 animate-pulse ${rounded ? "rounded-full" : "rounded-xl"}`}
    style={{ width, height }}
  />
);

export default Skeleton;
