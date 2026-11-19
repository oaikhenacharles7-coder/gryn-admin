export async function requestSignOut(path,send=fetch){
 const response=await send(path,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',cache:'no-store',signal:AbortSignal.timeout(20000)});
 if(!response.ok){let message='Sign out failed. Please retry.';try{message=(await response.json()).error||message;}catch{}throw Error(message);}
}
