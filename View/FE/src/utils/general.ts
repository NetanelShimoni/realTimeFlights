// check if it will land in this 15 min (add 15min to now time and check)
export const calculateTimeArrival = (
  flightTime: any,
  isOnGroundToReady = false
) => {
  let min = 60000 * 15;

  const dateAfterAdded15Min = new Date(new Date().getTime() + min);

  if (
    Math.abs(new Date(flightTime).getTime() - dateAfterAdded15Min.getTime()) <=
    15 * 60000
  ) {
    return true;
  }
  return false;
};

// check if it will departure in this 15 min (sub 15min to now time and check)
export const calculateTimeDeparture = (flightTime: any) => {
  let min = 60000 * 15;
  console.log(new Date(new Date().getTime() - min), new Date(flightTime));
  const dateAfterSub15Min = new Date(new Date().getTime() - min); //check

  if (
    new Date(flightTime).getTime() - dateAfterSub15Min.getTime() <=
    15 * 60000
  ) {
    return true;
  }
  return false;
};
