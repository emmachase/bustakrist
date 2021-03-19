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
