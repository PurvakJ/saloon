const API = "https://script.google.com/macros/s/AKfycbyH--dzm_E9jq_gNrd4k8ZAYaQSgrQxgvR0KTcKH0wTcLJtd1CUWcivqL3w_qMY0RG5VA/exec";

export async function callAPI(data) {

  const res = await fetch(API,{
    method:"POST",
    body:JSON.stringify(data)
  });

  return res.json();
}