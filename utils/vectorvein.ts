const axios = require('axios');

const api_key = "";
const url = "https://vectorvein.com/api/v1/open-api/workflow/run";
const headers = {
  "VECTORVEIN-API-KEY": api_key
};
const payload = {
  "wid": "decd39baeb824130b5dd6e5aa3f880ea",
  "data": {
    "nodes": {
      "7742d1c1-6e1b-4cd9-9861-4287da82eb5b": {
        "url_or_bvid": "https://www.bilibili.com/video/BV15h4y1T7y6/?spm_id_from=333.337.search-card.all.click"
      }
    }
  }
};

export const vectorveinRequest = () => {
  axios.post(url, payload, {
    headers: headers
  })
    .then((response: any) => {
      const result = response.data;

      if (response.status != 200 || result["status"] != 200) {
        console.log("Run workflow failed!");
        process.exit(1);
      }

      const record_id = result["data"]["rid"];
      const payload = {
        "rid": record_id
      };
      const url = "https://vectorvein.com/api/v1/open-api/workflow/check-status";
      axios.post(url, payload, {
        headers: headers
      })
        .then((response: any) => {
          let result = response.data;
          console.log(response.status);
          console.log(result);
          while (result["status"] == 202) {
            sleep(5);
            axios.post(url, payload, {
              headers: headers
            })
              .then((response: any) => {
                result = response.data;
                console.log(response.status);
                console.log(result);
              })
              .catch((error: any) => {
                console.error(error);
              });
          }
        })
        .catch((error: any) => {
          console.error(error);
        });
    })
    .catch((error: any) => {
      console.error(error);
    });
}

function sleep(seconds: number) {
  const waitUntil = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() < waitUntil) { }
}