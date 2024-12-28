import { ICustomerSession, ISessionWithDetails } from "@/types";

/**
 * Mock data for a customer session
 * @type {ICustomerSession}
 */
export const mock_Customer: ICustomerSession = {
  _id: "66fe90292ffaea2279cecfe5",
  sessionId: "66fe90002ffaea2279cecfda",
  date: new Date("2024-10-26T22:00:00.000Z"),
  createdAt: new Date("2024-10-03T12:38:01.334Z"),
  validatedAt: new Date("2024-10-03T12:38:01.334Z"),
  canceledAt: null,
  status: "Validated",
  typeOfReservation: "ByCompany",
  number_of_people: 1,
  last_name: "JONES",
  first_names: "JOHN",
  email: "johnjones@exemple.com",
  phone: "0600000000",
  people_list: [
    {
      size: "175",
      weight: "90",
      price_applicable: 45,
      isReduced: false,
    },
  ],
  price_applicable: 45,
  price_total: 45,
  tarification: "standard",
};

/**
 * Mock data for a session with details
 * @type {ISessionWithDetails}
 */
export const mock_SessionWithDetails: ISessionWithDetails = {
  _id: "66fe90002ffaea2279cecfda",
  status: "Actif",
  date: new Date("2024-10-26T22:00:00.000Z"),
  startTime: "10:00",
  endTime: "12:00",
  activity: {
    required_equipment: "Raquettes, gants, casque, harnais, gilet de sauvetage",
    price_half_day: {
      ACM: 0,
      reduced: 40,
      standard: 45,
    },
    price_full_day: {
      ACM: 0,
      reduced: 65,
      standard: 70,
    },
    duration: {
      half: "3h30",
      full: "6h00",
    },
    _id: "6641ffca191d2f9f5c027423",
    name: "Randonnée Aquatique ",
    description:
      "Descente de canyon en eaux vives. Mélange de multiples sauts, toboggans naturels et cheminements aquatiques.",
    half_day: true,
    full_day: true,
    min_age: 10,
    max_OfPeople: 10,
    min_OfPeople: 4,
  },
  spot: {
    meetingPoint: {
      half_day: "43.512472385578945, 2.47865565751822",
      full_day: "43.51452648570767, 2.471510253488647",
    },
    _id: "66420191191d2f9f5c027d1c",
    name: "Gorges du banquet",
    description: "",
    gpsCoordinates: "43.510228265845974, 2.4722576710777697",
    practicedActivities: [
      {
        activityName: "Randonée Aquatique",
        activityId: "6641ffca191d2f9f5c027423",
        _id: "66420191191d2f9f5c027d1d",
      },
    ],
    estimatedDuration: "3h30",
    photo:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiTF-RdunSG8uEH_Ku2eS8Qu2_n0cn28pKPrWuYXG8ITFoQU_9Qshl-dekTG_b8fZEkrlcx5ul_AEEtSPeObaU8-30pbAtfyq0ychTLYCPvLc3HbrbAsNg0uRQg6bZaayDj-DG7Ry-ciooM/s880/gorges+du+banquet+2.JPG",
  },
  placesMax: 10,
  placesReserved: 2,
  type_formule: "half_day",
  duration: "3h34",
  customerSessions: [
    {
      _id: "66fe90292ffaea2279cecfe5",
      sessionId: "66fe90002ffaea2279cecfda",
      date: new Date("2024-10-26T22:00:00.000Z"),
      createdAt: new Date("2024-10-03T12:38:01.334Z"),
      validatedAt: new Date("2024-10-03T12:38:01.334Z"),
      canceledAt: null,
      status: "Validated",
      typeOfReservation: "ByCompany",
      number_of_people: 1,
      last_name: "JONES",
      first_names: "JOHN",
      email: "johnjones@exemple.com",
      phone: "0600000000",
      people_list: [
        {
          size: "175",
          weight: "90",
          price_applicable: 45,
          isReduced: false,
        },
      ],
      price_applicable: 45,
      price_total: 45,
      tarification: "standard",
    },
    {
      _id: "66fe95942ffaea2279ced030",
      sessionId: "66fe90002ffaea2279cecfda",
      date: new Date("2024-10-26T22:00:00.000Z"),
      createdAt: new Date("2024-10-03T13:01:08.263Z"),
      validatedAt: new Date("2024-10-03T13:01:08.263Z"),
      status: "Canceled",
      typeOfReservation: "ByCompany",
      number_of_people: 2,
      last_name: "DOE",
      first_names: "JANE",
      email: "janedoe@exemple.com",
      phone: "0600000001",
      people_list: [
        {
          size: "200",
          weight: "85",
          price_applicable: 45,
          isReduced: false,
        },
        {
          size: "160",
          weight: "30",
          price_applicable: 40,
          isReduced: true,
        },
      ],
      price_applicable: 45,
      price_total: 85,
      tarification: "standard",
      canceledAt: new Date("2024-10-07T10:18:03.070Z"),
    },
    {
      _id: "6703d799bdc66c63c9fd2e6f",
      sessionId: "66fe90002ffaea2279cecfda",
      date: new Date("2024-10-26T22:00:00.000Z"),
      createdAt: new Date("2024-10-07T12:44:09.901Z"),
      validatedAt: new Date("2024-10-07T12:44:09.901Z"),
      canceledAt: null,
      status: "Validated",
      typeOfReservation: "ByCompany",
      number_of_people: 1,
      last_name: "DENIS",
      first_names: "AURELIEN",
      email: "denisaurelien@exemple.com",
      phone: "0600000002",
      people_list: [
        {
          size: "1",
          weight: "1",
          price_applicable: 40,
          isReduced: false,
        },
      ],
      price_applicable: 40,
      price_total: 40,
      tarification: "reduced",
    },
  ],
};

export const getMockData = () => {
  return {
    mock_Customer,
    mock_SessionWithDetails,
  };
};
