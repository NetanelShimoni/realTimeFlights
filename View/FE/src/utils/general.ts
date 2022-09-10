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

export const calculateTimeDeparture = (flightTime: any) => {
  let min = 60000 * 15;
  const dateAfterSub15Min = new Date(new Date().getTime() + min);

  if (
    dateAfterSub15Min.getTime() - new Date(flightTime).getTime() <=
    15 * 60000
  ) {
    return true;
  }
  return false;
};
