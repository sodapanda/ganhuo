import React, { useRef, useReducer, useEffect } from "react";
import { Stack, Text, ActionIcon, Progress, Indicator } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { Calendar } from '@mantine/dates';

export default function Ganhuo() {
    const lastTime = useRef(0)
    const mTimerId = useRef(0)

    useEffect(() => {
        window.app.onLockScreen((value) => {
            console.log(`web get lock screen ${value}`)

            stopPolling()
        })
    }, [])

    const initState = {
        duration: 0,
        persentage: 0,
        availablePersentage: 0,
        isPolling: false
    }

    const [mState, dispatch] = useReducer((state, action) => {
        if (action.type === 'switch') {
            if (action.mSwitch === 'on') {
                return { ...state, isPolling: true }
            } else {
                return { ...state, isPolling: false }
            }
        } else if (action.type === 'tik') {
            if (isUserWorking()) {
                console.log(action.nowUptime)
                console.log(`上次:${lastTime.current} 本次:${action.nowUptime} 差:${action.nowUptime - lastTime.current} 上次累计:${state.duration} 本次累积:${state.duration + action.nowUptime - lastTime.current}`)
                const aDuration = action.nowUptime - lastTime.current
                lastTime.current = action.nowUptime
                return { ...state, duration: state.duration + aDuration }
            } else {
                lastTime.current = action.nowUptime
                notifyToWork()
                return state
            }
        }
        return state
    }, initState)

    async function startPolling() {
        dispatch({ type: 'switch', mSwitch: 'on' })
        lastTime.current = await window.app.uptime();

        mTimerId.current = setInterval(async () => {
            const nowTime = await window.app.uptime();
            dispatch({ type: 'tik', nowUptime: nowTime })
        }, 1000)
    }

    function stopPolling() {
        dispatch({ type: 'switch', mSwitch: 'off' })
        lastTime.current = 0

        if (mTimerId.current !== 0) {
            clearInterval(mTimerId.current)
            mTimerId.current = 0
        }
    }

    function isUserWorking() {
        return true;
    }

    function notifyToWork() {

    }

    return (
        <div className="mx-10" >
            <Stack>
                <Text size="xl" fw={700} c="blue" className="mt-8">{`${mState.duration}秒`}</Text>
                <div className="flex w-full items-center">
                    {!mState.isPolling ?
                        <ActionIcon variant="filled" aria-label="start" onClick={() => { startPolling() }}>
                            <IconPlayerPlay style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon> :
                        <ActionIcon variant="filled" aria-label="pause" onClick={() => { stopPolling() }}>
                            <IconPlayerPause style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>}
                    <Progress.Root size="xl" className="flex-grow w-fit ml-4">
                        <Progress.Section value={35} color="cyan" />
                        <Progress.Section value={28} color="pink" />
                    </Progress.Root>
                </div>

                <Calendar className="mx-auto mt-6"
                    static
                    renderDay={(date) => {
                        const day = date.getDate();
                        return (
                            <Indicator size={6} color="red" offset={-2} disabled={day !== 16}>
                                <div>{day}</div>
                            </Indicator>
                        );
                    }}
                />
            </Stack>

        </div>
    )
}