import React from "react";
import * as Icons from "react-bootstrap-icons";
import cx from "classnames";
import Button from "./lib/Button";
import Markdown from "./editors/Markdown";
import Script from "./editors/Script";
import Form from "./editors/Form";
import Context from "../context";

export default function Step(props: {
  data: Types.Step;
  stepValue: Types.StepInstanceValue | null;
  updateContent: (content: string) => void;
  updateArgs: (args: string[]) => void;
  updateStepValue: (value: Types.FieldValue) => void;
  updateCompleted: (completed: boolean) => void;
  toggleRequired: () => void;
  mappedArgs: string;
  deleteStep: () => void;
  runScript?: () => void;
  locked: boolean;
  moveStep: (dir: -1 | 1) => void;
  frozen: boolean;
}) {
  const {
    data,
    stepValue,
    updateContent,
    updateArgs,
    updateStepValue,
    updateCompleted,
    toggleRequired,
    deleteStep,
    mappedArgs,
    runScript,
    locked,
    moveStep,
    frozen,
  } = props;
  const context = React.useContext(Context);
  const ref = React.useRef(null);

  // const handleWindowClick = (e: any) => {
  //   if (ref.current && !(ref.current as any).contains(e.target)) {
  //     if (context.selectedStep?.id === data.id) {
  //       context.selectStep(null, null);
  //     }
  //   }
  // };

  // React.useEffect(() => {
  //   document.addEventListener("mousedown", handleWindowClick);
  //   return () => {
  //     document.removeEventListener("mousedown", handleWindowClick);
  //   };
  // }, []);

  const editorComponentMap = React.useCallback(() => {
    switch (data.type) {
      case "form":
        return (
          <Form
            data={data}
            stepValue={stepValue}
            update={
              locked ? () => null : (value: string) => updateContent(value)
            }
            updateValue={(v) => updateStepValue(v)}
          />
        );
      case "markdown":
        return (
          <Markdown
            data={data}
            update={
              locked ? () => null : (value: string) => updateContent(value)
            }
            locked={locked}
          />
        );
      case "script":
        return (
          <Script
            data={data}
            stepValue={stepValue}
            update={
              locked ? () => null : (value: string) => updateContent(value)
            }
            run={runScript}
            mappedArgs={mappedArgs}
            selected={context.selectedStep?.id === data.id}
            locked={locked}
            frozen={frozen}
          />
        );
    }
  }, [data, stepValue, updateContent, runScript]);

  return (
    <div
      ref={ref}
      className={cx("group/step relative")}
      onClick={() =>
        context.selectStep(
          data,
          data.type === "script" ? updateArgs : updateContent
        )
      }
      onFocus={() =>
        context.selectStep(
          data,
          data.type === "script" ? updateArgs : updateContent
        )
      }
      // onBlur={() => context.selectStep(null, null)}
    >
      {!locked ? (
        <div className="absolute z-10 right-0 text-xs bg-gray-400/20 flex opacity-0 group-hover/step:opacity-100 transition duration-200">
          <Button
            Icon={data.required ? Icons.CheckSquareFill : Icons.CheckSquare}
            onClick={toggleRequired}
            title="Toggle checked requirement"
          />
          <Button
            Icon={Icons.ArrowUp}
            onClick={() => moveStep(-1)}
            title="Move up"
          />
          <Button
            Icon={Icons.ArrowDown}
            onClick={() => moveStep(1)}
            title="Move down"
          />
          <Button
            style="negative"
            Icon={Icons.Trash3Fill}
            onClick={() => deleteStep()}
            title="Delete block"
          />
        </div>
      ) : null}
      <div
        className={cx(
          "w-full transition duration-200 border border-transparent",
          {
            flex: data.required,
            "group-hover/step:border-gray-400/20":
              context.selectedStep?.id !== data.id,
            "border-gray-400/50": context.selectedStep?.id === data.id,
          }
        )}
      >
        {data.required ? (
          <div className="flex-shrink-0 border-r-2 border-gray-400/20">
            {data.type === "script" &&
            stepValue &&
            stepValue.status === "running" ? (
              <div className="px-1.5 py-1 animate-spin">
                <Icons.DashCircleDotted />
              </div>
            ) : frozen ? (
              <div
                className="px-1.5 py-1 opacity-20"
                title="Required steps not completed"
              >
                {data.type === "script" ? (
                  <Icons.CaretRightSquare />
                ) : (
                  <Icons.Square />
                )}
              </div>
            ) : (
              <Button
                Icon={
                  data.type === "script"
                    ? stepValue?.completed
                      ? Icons.CheckSquareFill
                      : Icons.CaretRightSquare
                    : stepValue?.completed
                    ? Icons.CheckSquareFill
                    : Icons.Square
                }
                onClick={() => {
                  if (data.type === "script" && runScript) {
                    if (stepValue?.completed) {
                      updateCompleted(!stepValue?.completed);
                    } else {
                      runScript();
                    }
                  } else {
                    updateCompleted(!stepValue?.completed);
                  }
                }}
              />
            )}
          </div>
        ) : null}
        <div
          className={cx("w-full", {
            "": data.required,
          })}
        >
          {editorComponentMap()}
        </div>
      </div>
    </div>
  );
}