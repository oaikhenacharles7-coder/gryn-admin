// Notifications are created once per delivered message; IDs prevent duplicate counts.
export function unreadChat(list=[]){const seen=new Set();return list.filter(n=>!n.read&&n.kind==='message'&&n.route==='chat'&&!seen.has(n.id)&&seen.add(n.id));}
export function threadUnread(list,id){return unreadChat(list).filter(n=>n.recordId===id);}
