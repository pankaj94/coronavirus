export const getAPIdata = (url) =>{
    return fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          return result;
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          return error;
        }
      )

  }