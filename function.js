function locationCheck(userLocation){
 if (userLocation.before.lat === userLocation.after.lat){
  if (userLocation.before.lng === userLocation.after.lng) {
   return "NoChange";
  }else{
   return "Change";
  }
 }else{
  return "Change";
 }
}
exports.locationCheck = locationCheck;


