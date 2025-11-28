import styled from 'styled-components';

interface StepperProps {
    steps: {
        title: string;
        status: string;
        time?: string;
        completed: boolean;
        active: boolean;
    }[];
    currentStep: number;
}

export const Stepper = ({ steps }: StepperProps) => {
    return (
        <StyledWrapper>
            <div className="stepper-box">
                {steps.map((step, index) => (
                    <div key={index} className={`stepper-step ${step.completed ? 'stepper-completed' : ''} ${step.active ? 'stepper-active' : ''} ${!step.completed && !step.active ? 'stepper-pending' : ''}`}>
                        <div className="stepper-circle">
                            {step.completed ? (
                                <svg viewBox="0 0 16 16" className="bi bi-check-lg" fill="currentColor" height={16} width={16} xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                </svg>
                            ) : (
                                index + 1
                            )}
                        </div>
                        <div className="stepper-line" />
                        <div className="stepper-content">
                            <div className="stepper-title">{step.title}</div>
                            <div className="stepper-status">{step.status}</div>
                            {step.time && <div className="stepper-time">{step.time}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .stepper-box {
    background-color: white;
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .stepper-step {
    display: flex;
    margin-bottom: 32px;
    position: relative;
  }

  .stepper-step:last-child {
    margin-bottom: 0;
  }

  .stepper-line {
    position: absolute;
    left: 19px;
    top: 40px;
    bottom: -32px;
    width: 2px;
    background-color: #e2e8f0;
    z-index: 1;
  }

  .stepper-step:last-child .stepper-line {
    display: none;
  }

  .stepper-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    z-index: 2;
    background-color: white;
    font-weight: bold;
  }

  .stepper-completed .stepper-circle {
    background-color: #F97316; /* Orange-500 */
    color: white;
  }

  .stepper-active .stepper-circle {
    border: 2px solid #F97316;
    color: #F97316;
  }

  .stepper-pending .stepper-circle {
    border: 2px solid #e2e8f0;
    color: #94a3b8;
  }

  .stepper-content {
    flex: 1;
  }

  .stepper-title {
    font-weight: 600;
    margin-bottom: 4px;
    color: #1e293b;
  }

  .stepper-completed .stepper-title {
    color: #1e293b;
  }

  .stepper-active .stepper-title {
    color: #F97316;
  }

  .stepper-pending .stepper-title {
    color: #94a3b8;
  }

  .stepper-status {
    font-size: 13px;
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    margin-top: 4px;
  }

  .stepper-completed .stepper-status {
    background-color: #ffedd5; /* Orange-100 */
    color: #c2410c; /* Orange-700 */
  }

  .stepper-active .stepper-status {
    background-color: #ffedd5;
    color: #c2410c;
  }

  .stepper-pending .stepper-status {
    background-color: #f1f5f9;
    color: #64748b;
  }

  .stepper-time {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
  }
`;
