import { Box, Flex, Image, useColorModeValue } from '@chakra-ui/react';
import { ChangeEvent } from 'react';

import { searchSrc } from '@/assets';

type SearchBarProps = {
  search: string;
  setSearch: (arg0: string) => any;
};

export const SearchBar = ({ search, setSearch }: SearchBarProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    setSearch(inputValue);
  };

  const bg = useColorModeValue('gray.100', 'custom.3');

  return (
    <Flex
      boxSizing="border-box"
      px={4}
      mb={4}
      bg={bg}
      w="100%"
      h={10}
      borderRadius={12}
    >
      <Image src={searchSrc} alt="search" w={4} mr={3} />
      <Box
        as="input"
        value={search}
        bg={bg}
        border="none"
        w="100%"
        color="gray.50"
        outline="none"
        fontWeight={400}
        placeholder="Search by name or canister id"
        onChange={handleSearchChange}
        _placeholder={{
          color: 'custom.1',
        }}
      />
    </Flex>
  );
};
