import React from 'react';
import { MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const Pagination = ({ pageNumber, setPageNumber, totalItem, parPage, showItem }) => {
    const totalPage = Math.ceil(totalItem / parPage);

    // Xác định phạm vi trang hiển thị
    let startPage = Math.max(1, pageNumber - Math.floor(showItem / 2));
    let endPage = startPage + showItem - 1;

    if (endPage > totalPage) {
        endPage = totalPage;
        startPage = Math.max(1, endPage - showItem + 1);
    }

    const createBtn = () => {
        const btns = [];
        for (let i = startPage; i <= endPage; i++) {
            btns.push(
                <li
                    key={i}
                    onClick={() => setPageNumber(i)}
                    className={`
                        w-[33px] h-[33px] rounded-full flex justify-center items-center cursor-pointer transition duration-300
                        ${pageNumber === i
                        ? 'bg-green-700 text-white shadow-lg shadow-green-300/50'
                        : 'bg-slate-600 text-[#d0d2d6] hover:bg-green-400 hover:text-white hover:shadow-md'}
                    `}
                >
                    {i}
                </li>
            );
        }
        return btns;
    };

    return (
        <ul className='flex gap-3 mt-4'>
            {pageNumber > 1 && (
                <li
                    onClick={() => setPageNumber(pageNumber - 1)}
                    className='w-[33px] h-[33px] rounded-full flex justify-center items-center bg-slate-300 text-black cursor-pointer hover:bg-slate-400 transition'
                >
                    <MdOutlineKeyboardDoubleArrowLeft />
                </li>
            )}

            {createBtn()}

            {pageNumber < totalPage && (
                <li
                    onClick={() => setPageNumber(pageNumber + 1)}
                    className='w-[33px] h-[33px] rounded-full flex justify-center items-center bg-slate-300 text-black cursor-pointer hover:bg-slate-400 transition'
                >
                    <MdOutlineKeyboardDoubleArrowRight />
                </li>
            )}
        </ul>
    );
};

export default Pagination;
