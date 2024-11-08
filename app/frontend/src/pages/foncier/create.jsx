import React from 'react';
import DynamicWorkflowForm from '../workflow/workflowform';

const FoncierWorkflowForm = () => {
    const mapp = {
        step_one: 1,
        step_two: 2,
        step_three: 3,
        step_four: 4,
        step_five: 5,
        step_six: 6,
        step_seven: 7,
    };

    return (
        <DynamicWorkflowForm workflowType="foncier" steps={7} mapping={mapp} workflowname={"Foncier"} />
    );
};

export default FoncierWorkflowForm;
