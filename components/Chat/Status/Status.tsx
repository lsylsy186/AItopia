import React, {
  FC,
} from "react";

export const Status: FC<any> = (props: any) => {
  const { show, text } = props;
  return (
    <>{show && <div className="absolute flex items-center gap-2 flex-grow select-none z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
      {text}
    </div>}</>
  );
};