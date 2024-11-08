import React from 'react';
import DynamicWorkflowForm from '../workflow/workflowform';

const OccupationWorkflowForm = () => {
    const mapp = {
        step_one: 1,
        step_two: 2,
  
    };

    return (
        <DynamicWorkflowForm workflowType="occupation" steps={2} mapping={mapp} workflowname={"Occupation"} />
    );
};

export default OccupationWorkflowForm;
