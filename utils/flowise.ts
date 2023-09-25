export const queryFlowise = async (data: any) => {
  const response = await fetch(
    "https://flowiseai-railway-production-bfbc.up.railway.app/api/v1/prediction/b5f842c5-5fe9-462c-8667-70c83eb723f6",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
  const result = await response.json();
  return result;
};