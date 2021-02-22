// export interface QueryablePromise<T> extends Promise<T> {
//   isRejected: () => boolean
//   isFulfilled: () => boolean
//   isPending: () => boolean
// }

import { useRef, useState } from "react";

// export function queryPromise<T>(promise: Partial<QueryablePromise<T>>): QueryablePromise<T> {
//   // Don"t modify any promise that has been already modified.
//   if (promise.isFulfilled) return promise as QueryablePromise<T>;

//   // Set initial state
//   let isPending = true;
//   let isRejected = false;
//   let isFulfilled = false;

//   // Observe the promise, saving the fulfillment in a closure scope.
//   const result = promise.then!(
//       (v) => {
//         console.log("HAHAHAH");
//           isFulfilled = true;
//           isPending = false;
//           return v;
//       },
//       (e) => {
//         console.log("WHATTTT");
//           isRejected = true;
//           isPending = false;
//           throw e;
//       },
//   ) as QueryablePromise<T>;

//   result.isFulfilled = () => isFulfilled;
//   result.isPending = () => isPending;
//   result.isRejected = () => isRejected;
//   return result;
// }
export const suspend = <T>(promise: Promise<T>, lastValue?: T) => {
  let result: T;
  let status = "pending";
  const suspender = promise.then(response => {
    status = "success";
    result = response;
  }, error => {
    status = "error";
    result = error;
  });

  return () => {
    switch (status) {
      case "pending":
        if (lastValue) return lastValue;
        else throw suspender;
      case "error":
        throw result;
      default:
        return result;
    }
  };
};
