/**
 * Interface for a spot
 * @property {string} _id - The id of the spot
 * @property {string} name - The name of the spot
 * @property {string} description - The description of the spot
 * @property {string} gpsCoordinates - The gps coordinates of the spot
 * @property {string} practicedActivities - The activities practiced in the spot
 * @property {string} photo - The photo of the spot
 * @property {boolean} half_day - The half day availability of the spot
 * @property {boolean} full_day - The full day availability of the spot
 * @property {number} max_OfPeople - The maximum number of people for the spot
 */
export interface ISpot {
  _id: string;
  name: string;
  description: string;
  gpsCoordinates: string;
  practicedActivities: {
    activityId: string;
    activityName: string;
    _id: string;
  }[];
  photo: string;
  meetingPoint: {
    half_day: string | null;
    full_day: string | null;
  };
  estimatedDuration: string;
}
