import styled from 'styled-components';

interface PhotoButtonProps {
    onClick: () => void;
    label?: string;
}

export const PhotoButton = ({ onClick, label = "Take a Photo" }: PhotoButtonProps) => {
    return (
        <StyledWrapper onClick={onClick}>
            <button className="button" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" height={24} fill="none" className="svg-icon"><g strokeWidth={2} strokeLinecap="round" stroke="#fff" fillRule="evenodd" clipRule="evenodd"><path d="m4 9c0-1.10457.89543-2 2-2h2l.44721-.89443c.33879-.67757 1.03131-1.10557 1.78889-1.10557h3.5278c.7576 0 1.4501.428 1.7889 1.10557l.4472.89443h2c1.1046 0 2 .89543 2 2v8c0 1.1046-.8954 2-2 2h-12c-1.10457 0-2-.8954-2-2z" /><path d="m15 13c0 1.6569-1.3431 3-3 3s-3-1.3431-3-3 1.3431-3 3-3 3 1.3431 3 3z" /></g></svg>
                <span className="lable">{label}</span>
            </button>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 9px 12px;
    gap: 8px;
    height: 50px;
    width: 100%;
    border: none;
    background: #F97316;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .lable {
    line-height: 22px;
    font-size: 17px;
    color: #fff;
    font-family: sans-serif;
    letter-spacing: 1px;
    font-weight: bold;
  }

  .button:hover {
    background: #ea580c;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
  }

  .button:hover .svg-icon {
    animation: flickering 2s linear infinite;
  }

  @keyframes flickering {
    0% { opacity: 1; }
    50% { opacity: 1; }
    52% { opacity: 1; }
    54% { opacity: 0; }
    56% { opacity: 1; }
    90% { opacity: 1; }
    92% { opacity: 0; }
    94% { opacity: 1; }
    96% { opacity: 0; }
    98% { opacity: 1; }
    99% { opacity: 0; }
    100% { opacity: 1; }
  }`;
