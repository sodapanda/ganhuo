import React from "react";
import { Stack, Text, ActionIcon, Progress, Indicator } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { Calendar } from '@mantine/dates';

export default function Ganhuo() {
    return (
        <div className="mx-10" >
            <Stack>
                <Text size="xl" fw={700} c="blue" className="mt-8">00:29</Text>
                <div class="flex w-full items-center">
                    <ActionIcon variant="filled" aria-label="start">
                        <IconPlayerPlay style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
                    <ActionIcon variant="filled" aria-label="pause">
                        <IconPlayerPause style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
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