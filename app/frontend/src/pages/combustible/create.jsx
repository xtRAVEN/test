import React from 'react';
import DynamicWorkflowForm from '../workflow/workflowform';

const CombustibleWorkflowForm = () => {
    const mapp = {
        step_one: 1,
        step_two: 2,
       
    };

    return (
        <DynamicWorkflowForm workflowType="combustible" steps={2} mapping={mapp} workflowname={"Combustible"}/>
    );
};

export default CombustibleWorkflowForm;
