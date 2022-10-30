import React from "react";
import { AiFillStar } from "react-icons/ai";
import { grey200, orange } from "../../theme";

interface ReviewStarsProps {
  reviewScore: number;
  reviewsCounter?: number;
}

export const ReviewStars: React.FC<ReviewStarsProps> = ({
  reviewScore,
  reviewsCounter,
}) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {[...Array(5)].map((star, index) => {
          const starIndex = index + 1;
          return (
            <AiFillStar
              key={index}
              // value={starIndex}
              fontSize="1rem"
              color={reviewScore >= starIndex ? orange : grey200}
            />
          );
        })}
      </div>
      <div>
        <p className="ml-2 inline">{reviewScore.toFixed(1)}</p>

        {reviewsCounter && (
          <p className="inline">
            ({reviewsCounter} {reviewsCounter > 1 ? "reviews" : "review"})
          </p>
        )}
      </div>
    </div>
  );
};
