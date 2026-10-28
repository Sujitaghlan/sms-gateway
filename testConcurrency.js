
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc5MzA3OTUwNCwiZXhwIjoxNzkzMDgzMTA0fQ.OVKo4Y-pbftPjJNBvIGN_Di_P7lhRHbc5POaFV6_fFw";
const URL = "http://localhost:3000/api/sms/send";

async function sendRequest(index) {
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        phoneNumbers: ["9841234567"],
        message: `Concurrency test ${index}`,
      }),
    });

    const data = await response.json();

    return {
      request: index,
      status: response.status,
      message: data.message || "Request completed",
    };
  } catch (error) {
    return {
      request: index,
      status: "ERROR",
      message: error.message,
    };
  }
}

async function main() {
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) => sendRequest(i + 1))
  );

  console.table(results);

  const successful = results.filter(
    (result) => result.status >= 200 && result.status < 300
  ).length;

  console.log("Successful requests:", successful);
  console.log("Failed requests:", results.length - successful);
}

main();
