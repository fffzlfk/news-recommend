import Feed from "../../components/Feed";
import Nav from "../../components/Nav";
import { useRouter } from "next/router";
import { Flex, ListItem, UnorderedList, VStack } from "@chakra-ui/layout";
import { ButtonGroup, Button } from "@chakra-ui/button";
import Head from 'next/head';

import API_BASE_URL from './../_baseurl.json'
import { categoryMapping } from "../../lib/util.ts";
import {Heading, Stack, Checkbox } from "@chakra-ui/react";
import { useState } from "react";

export default function Recommend({ isColdStart, category, articles, page, page_num, states }) {
    if (isColdStart) {
        const [items, setItems] = useState([
            {
                name: "business",
                isChecked: false,
            },
            {
                name: "entertainment",
                isChecked: false,
            },
            {
                name: "health",
                isChecked: false,
            },
            {
                name: "science",
                isChecked: false,
            },
            {
                name: "sports",
                isChecked: false,
            },
            {
                name: "technology",
                isChecked: false,
            },
        ]);

        const router = useRouter();

        const handleOnChange = index => {
            let newItems = [...items];
            newItems[index].isChecked = !newItems[index].isChecked;
            setItems(newItems);
        }

        const submit = async e => {
            e.preventDefault();

            const categorys = items.filter(item => item.isChecked).map(item => item.name);

            await fetch(`${API_BASE_URL}/coldstart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(categorys)
            })

            router.reload();
        }


        return (
            <Flex direction='column'>
                <Head>
                    <title>{categoryMapping(category)}</title>
                </Head>
                <Nav auth={true} category={category} />
                <VStack paddingTop={20} spacing={10}>
                    <Heading>?????????????????????????????????</Heading>
                    <Flex>
                        {items.map((item, index) => <Checkbox key={index} isChecked={item.isChecked} onChange={() => handleOnChange(index)}>{categoryMapping(item.name)}</Checkbox>)}
                    </Flex>
                    <Button onClick={e => submit(e)}>??????</Button>
                </VStack>
            </Flex>
        );
    }

    const items = articles.map((item, index) => <ListItem paddingTop='3' key={index}><Feed item={item} like={states[index]} isRecommend={category === 'recommend'} /></ListItem>);
    page = parseInt(page, 10);
    page_num = parseInt(page_num, 10);
    const router = useRouter();

    return (
        <Flex direction='column'>
            <Head>
                <title>{categoryMapping(category)}</title>
            </Head>
            <Nav auth={true} category={category} />
            <VStack paddingBlock={5}>
                <UnorderedList>{items}</UnorderedList>
                <ButtonGroup>
                    <Button
                        onClick={() => router.push({
                            pathname: router.pathname,
                            query: {
                                page: page - 1,
                                category: category,
                            }
                        })}
                        isDisabled={page <= 1}>
                        Prev
                    </Button>
                    <Button
                        onClick={() => router.push({
                            pathname: router.pathname,
                            query: {
                                page: page + 1,
                                category: category,
                            }
                        })}
                        isDisabled={page >= page_num}>
                        Next
                    </Button>
                    <Button
                        onClick={() => router.push({
                            pathname: router.pathname,
                            query: {
                                page: 1,
                                category: category,
                            }
                        })}>
                        First Page
                    </Button>
                </ButtonGroup>
            </VStack>
        </Flex>
    );
}

export async function getServerSideProps(ctx) {
    const category = ctx.params.category;
    const page = ctx.query.page || "1";

    const resp = await fetch(`${API_BASE_URL}/news/${category}?page=${page}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined
    });

    const data = await resp.json();
    const articles = data.data;
    const page_num = data.page_num;

    if (page_num == 0) {
        return { props: { isColdStart: true } }
    }

    const fetchLike = async (id) => {
        return await fetch(`${API_BASE_URL}/like/get?news_id=${id}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined
        })
            .then(resp => resp.json())
            .catch(e => console.log('??????:', e));
    }

    const states = await Promise.all(articles.map(item => fetchLike(item.id)));

    return { props: { category, articles, page, page_num, states } };
}
