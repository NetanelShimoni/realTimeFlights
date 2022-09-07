export const calculateTime = (flightTime: any, isOnGroundToReady = false) => {
  let min = 60000 * 15;
  if (isOnGroundToReady) {
    min = -60000 * 15;
  }
  const dateAfterAdded15Min = new Date(new Date().getTime() + min);
  if (
    Math.abs(new Date(flightTime).getTime() - dateAfterAdded15Min.getTime()) <=
    15 * 60000
  ) {
    return true;
  }
  return false;
};
