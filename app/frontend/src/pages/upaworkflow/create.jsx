import React from 'react';
import DynamicWorkflowForm from '../workflow/workflowform';

const UpaworkflowForm = () => {
    const mapp = {
        step_one: 1,
        step_two: 2,
        step_three: 3,
       
    };

    return (
        <DynamicWorkflowForm workflowType="upaworkflow" steps={3} mapping={mapp} workflowname={"Upaworkflow"}/>
    );
};

export default UpaworkflowForm;
