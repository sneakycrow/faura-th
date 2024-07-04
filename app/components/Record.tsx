"use client";

import React, { useState } from "react";

interface RecordProps {
  artist: string;
  album: string;
  title: string;
  releaseDate: string;
  cover: string;
}

const Record = ({ artist, album, title, releaseDate, cover }: RecordProps) => {
  const [isDetailsShown, setDetailsShown] = useState(false);
  return (
    <div
      className="w-[300px] h-[300px] border-cherry hover:border-coral transition-colors border-[20px] relative hover:cursor-pointer"
      onClick={() => setDetailsShown(!isDetailsShown)}
    >
      <div
        className={`${
          isDetailsShown ? "flex" : "hidden"
        }  flex-col items-start justify-start bg-darkpurple bg-opacity-90 text-coral p-4 absolute top-0 left-0 w-full h-full`}
      >
        <p>
          <strong>Artist</strong>:{artist}
        </p>
        <p>
          <strong>Album</strong>:{album}
        </p>
        <p>
          <strong>Title</strong>:{title}
        </p>
        <p>
          <strong>Released</strong>: {releaseDate}
        </p>
      </div>
      <img
        width={300}
        height={300}
        src={cover}
        alt={`Cover of ${title} by ${artist} from the album ${album}`}
        className=""
      />
    </div>
  );
};

export default Record;
