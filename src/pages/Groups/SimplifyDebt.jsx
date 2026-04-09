import React, { useEffect, useState, useCallback } from 'react';
import axios from "axios";
import Navbar from '../../components/Navbar';
import { useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { ReactComponent as Cash } from './cash-on-wallet.svg';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy } from "react-icons/md";
import Tooltip from '@mui/material/Tooltip';

const SimplifyDebt = ({ user, thememode, toggle }) => {
    const { id } = useParams();
    const [inputFields, setInputFields] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [data, setData] = useState([]);
    const [commentFlag, setCommentFlag] = useState(false);
    const [showPart, setShowPart] = useState(false);
    const [membersData, setMembersData] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);

    const handleShowPart = () => setShowPart(true);
    const handleClosePart = () => setShowPart(false);

    const handleCopyToClipboard = () => {
        alert("Copied to clipboard");
    };

    const getGroup = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getgroup/${id}`);
            setGroupData(res.data);
        } catch (err) {
            console.log(err);
        }
    }, [id]);

    const getMembers = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getmembers/${id}`);
            setMembersData(res.data);
        } catch (err) {
            console.log(err);
        }
    }, [id]);

    const getComments = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getcomments/${id}`);
            setComments(response.data.commentss);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, [id]);

    const handleInputChange = (index, fieldName, value) => {
        const updatedInputFields = [...inputFields];
        if (fieldName === 'paidFor') {
            const newPaidFor = [...updatedInputFields[index][fieldName]];
            if (newPaidFor.includes(value)) {
                newPaidFor.splice(newPaidFor.indexOf(value), 1);
            } else {
                newPaidFor.push(value);
            }
            updatedInputFields[index][fieldName] = newPaidFor;
        } else {
            updatedInputFields[index][fieldName] = value;
        }
        setInputFields(updatedInputFields);
    };

    const handleAddField = () => {
        setInputFields([...inputFields, { paidBy: '', paidFor: [], amount: '' }]);
    };

    const handleRemoveField = (index) => {
        const updatedInputFields = [...inputFields];
        updatedInputFields.splice(index, 1);
        setInputFields(updatedInputFields);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const resultMap = inputFields.reduce((result, item) => {
            const key = item.paidBy;
            const splitAmount = item.amount / item.paidFor.length;

            if (result[key]) {
                item.paidFor.forEach(paidForPerson => {
                    if (result[key].paidFor[paidForPerson]) {
                        result[key].paidFor[paidForPerson] += splitAmount;
                    } else {
                        result[key].paidFor[paidForPerson] = splitAmount;
                    }
                });
            } else {
                result[key] = {
                    paidBy: item.paidBy,
                    paidFor: {}
                };
                item.paidFor.forEach(paidForPerson => {
                    result[key].paidFor[paidForPerson] = splitAmount;
                });
            }
            return result;
        }, {});

        const outputArray = Object.values(resultMap);
        const simplify = async () => {
            try {
                const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/group/simplifyDebt/${id}`, { outputArray });
                setData(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        simplify();
        setInputFields([]);
    };

    useEffect(() => {
        const getDebts = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/group/getDebts/${id}`);
                setData(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getDebts();
    }, [id]);

    useEffect(() => {
        getComments();
    }, [getComments, commentFlag]);

    useEffect(() => {
        getGroup();
        getMembers();
    }, [getGroup, getMembers]);

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/group/addcomment`, {
                userId: user._id,
                text: commentText,
                groupId: id,
                username: user.username
            });
            setCommentText('');
            setCommentFlag(prev => !prev);
        } catch (err) {
            console.log(err);
        }
    };

    const CheckboxGroup = ({ options, selectedValues, onChange }) => (
        <div>
            {options.map((option, index) => (
                <div key={index} className='w-full flex justify-between align-middle items-center text-slate-700 m-2'>
                    <label className='w-[80%] dark:text-slate-300'>{option.username}</label>
                    <input
                        type="checkbox"
                        value={option.username}
                        checked={selectedValues.includes(option.username)}
                        onChange={(e) => onChange(e.target.value)}
                        className='h-6'
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div className='pb-2 dark:bg-[#181818] dark:text-white bg-[#f0f0f0] min-h-screen overflow-x-hidden'>
            <Navbar thememode={thememode} toggle={toggle} />
            <div className='font-extrabold text-2xl mx-4 mt-4 dark:text-[#f0f0f0]'>Simplify Debts</div>
            <div className='flex justify-between items-center mx-4 mt-4'>
                <div className="text-xl bg-[#f0f0f0] text-slate-500 dark:bg-[#181818] dark:text-[#f0f0f0] p-2 rounded-lg">
                    {groupData.title}
                </div>
                <div className='flex'>
                    <CopyToClipboard text={groupData.groupCode || ""} onCopy={handleCopyToClipboard}>
                        <Tooltip title="Copy group code to clipboard" arrow>
                            <button className='p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'>
                                <MdContentCopy className='text-xl' />
                            </button>
                        </Tooltip>
                    </CopyToClipboard>
                    <Tooltip title="View members" arrow>
                        <button onClick={handleShowPart} className='p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'>
                            <PeopleAltIcon sx={{ color: thememode === 'dark' ? 'white' : 'black' }} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <Modal show={showPart} onHide={handleClosePart} animation={false} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Group Participants</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='flex-col'>
                        {membersData?.map(data => (
                            <div key={data?._id}>{" "}{data?.username}{" "}</div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 mt-4'>
                <div className='bg-blue-100 p-4 rounded-lg shadow-md dark:bg-[#202020]'>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-4 dark:text-slate-300'>
                        {inputFields.map((field, index) => (
                            <div key={index} className='flex flex-col gap-2 border-b border-gray-300 pb-4 mb-2'>
                                <div className='flex flex-col gap-1'>
                                    <label className='text-slate-600 dark:text-slate-400'>Paid By</label>
                                    <select
                                        value={field.paidBy}
                                        onChange={(e) => handleInputChange(index, 'paidBy', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-[#181818] dark:text-white"
                                    >
                                        <option value="" disabled>Select a member</option>
                                        {membersData.map((member, i) => (
                                            <option key={i} value={member?.username}>{member?.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <label className='text-slate-600 dark:text-slate-400'>Paid For</label>
                                    <CheckboxGroup
                                        options={membersData}
                                        selectedValues={field.paidFor}
                                        onChange={(value) => handleInputChange(index, 'paidFor', value)}
                                    />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <label className='text-slate-500'>Amount</label>
                                    <input
                                        type="number"
                                        value={field.amount}
                                        onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                                        placeholder="Amount"
                                        className='w-full p-2 border border-gray-300 rounded-md dark:bg-[#181818] dark:text-white'
                                    />
                                </div>
                                <button type="button" className='bg-red-500 p-2 rounded-md text-white' onClick={() => handleRemoveField(index)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                        <div className='flex gap-2'>
                            <button type="button" onClick={handleAddField} className='bg-[#000080] p-2 rounded-md text-white flex-1'>
                                Add Payment
                            </button>
                            <button type="submit" className='bg-[#000080] p-2 rounded-md text-white flex-1'>
                                Simplify Debt
                            </button>
                        </div>
                    </form>
                </div>

                <div className='bg-white dark:bg-[#282828] p-4 rounded-lg shadow-md relative min-h-[300px]'>
                    {data && data.length > 0 ? (
                        <>
                            <div className='absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none'>
                                <Cash />
                            </div>
                            <div className='relative z-10'>
                                {data.map((debt, idx) => (
                                    <div key={idx} className='flex items-center bg-gray-100 dark:bg-[#333] rounded-2xl justify-between m-2 p-1 text-sm'>
                                        <div className='w-[60%] flex align-middle p-3'>{debt[0]} &#8594; {debt[1]} &#x20B9;{debt[2]}</div>
                                        {user?.username === debt[1] && (
                                            <button onClick={async () => {
                                                try {
                                                    const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/group/approveDebt/${id}`, debt);
                                                    setData(res.data.simplifyDebt);
                                                } catch (err) {
                                                    console.log(err);
                                                }
                                            }}
                                            className='bg-[#000080] p-1 px-3 rounded-md text-white m-2'>
                                                {debt[3] === true ? "Approved" : "Approve"}
                                            </button>
                                        )}
                                        {user?.username === debt[0] && debt[3] === true && <div className='p-3 text-green-500'>Approved ✅</div>}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className='flex justify-center items-center h-full opacity-30'>
                            <Cash style={{width: '100px', height: '100px'}} />
                        </div>
                    )}
                </div>
            </div>

            <div className='mx-4 mt-8'>
                <h3 className='font-bold mb-2'>Comments</h3>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        value={commentText}
                        onChange={handleCommentChange}
                        placeholder="Type your comment here"
                        className="w-full p-2 border border-gray-300 rounded-md dark:bg-[#181818] dark:text-white"
                    />
                    <button onClick={handleAddComment} className="bg-[#000080] p-2 px-4 rounded-md text-white whitespace-nowrap">
                        Post
                    </button>
                </div>
                <div className="mt-4 mb-20 flex flex-col gap-2">
                    {comments.map((comment) => (
                        <div key={comment._id} className={`rounded-2xl text-sm p-3 max-w-[80%] ${comment?.username === user?.username ? 'bg-blue-100 dark:bg-blue-900 self-end' : 'bg-gray-200 dark:bg-[#282828] self-start'}`}>
                            <p className='font-bold text-xs opacity-70'>{comment?.username === user?.username ? 'You' : comment?.username}</p>
                            <p>{comment.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SimplifyDebt;