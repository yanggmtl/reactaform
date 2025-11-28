/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ReactaDefinition } from "../core/reactaFormTypes";

const surveyForm: ReactaDefinition = {
  name: "surveyForm",
  version: "1.0",
  displayName: "Customer survey",
  properties: [
    ({
      name: "satisfaction",
      displayName: "Overall satisfaction",
      type: "rating",
      defaultValue: 4,
      min: 1,
      max: 5,
    } as any),
    ({
      name: "features",
      displayName: "Features used",
      type: "multiSelect",
      defaultValue: [],
      options: [
        { label: "Search", value: "search" },
        { label: "Profile", value: "profile" },
        { label: "Notifications", value: "notifications" }
      ],
      minCount: 1,
      maxCount: 3,
    } as any),
    {
      name: "comments",
      displayName: "Comments",
      type: "text",
      defaultValue: "",
    }
  ],
};

export default surveyForm;
