import Normal from "./normal.svg";
import Reversing from "./reversing.svg";
import Speeding from "./speeding.svg";
import DangerousLaneChanges from "./dangerousLaneChanges.svg";
import OccupyingEmergencyLanes from "./occupyingEmergencyLanes.svg";
import LowSpeed from "./lowSpeed.svg";
import Stopping from "./stopping.svg";

export const GetActionsIcons = (normal: boolean) => {
  if (normal) {
    return [
      Normal,
      Reversing,
      Speeding,
      DangerousLaneChanges,
      OccupyingEmergencyLanes,
      LowSpeed,
      Stopping
    ];
  }
  return [Reversing, Speeding, DangerousLaneChanges, OccupyingEmergencyLanes, LowSpeed, Stopping];
};
export const ActionsIcons = [
  Normal,
  Reversing,
  Speeding,
  DangerousLaneChanges,
  OccupyingEmergencyLanes,
  LowSpeed,
  Stopping
];
