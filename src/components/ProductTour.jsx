import React, { useMemo } from "react";
import Joyride from "react-joyride";

function ProductTour({ run, onComplete }) {
  const steps = useMemo(
    () => [
      { target: ".step1", content: "This is the activity log" },
      { target: ".step2", content: "This is the map that displaying latest saved location with snap to road functionality" },
      { target: ".step3", content: "This is the chart for showing the travel path" },
      { target: ".step4", content: "Here you can generate quick reports" },
      { target: ".step5", content: "Here you get notifications" },
      { target: ".step6", content: "Here is the logout option" },
      {target: '.step7', content: "You can lock or unlock drag & drop option of the widgets"},
      
      { target: ".step8", content: "Here you can take screenshot of entire dashboard" },
      {target:".step9", content:"Restart product tour"}

    ],
    []
  );

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep={false}
      showProgress
      showSkipButton
      styles={{ options: { zIndex: 10000 } }}
      callback={(data) => {
        const { status } = data;
        if (status === "finished" || status === "skipped") {
          localStorage.setItem("tourComplete", "true"); // persist
          onComplete?.();
        }
      }}
    />
  );
}

export default React.memo(ProductTour);
