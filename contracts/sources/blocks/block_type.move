module movecraft::block_type {
    use std::vector;

    use movecraft::cell_0;
    use movecraft::cell_1;
    use movecraft::cell_2;
    use movecraft::cell_3;
    use movecraft::cell_4;
    use movecraft::cell_5;
    use movecraft::cell_6;
    use movecraft::cell_7;

    const ENOT_VALID_BLOCK_TYPE: u64 = 10001;
    const BASE_URI: vector<u8> = b"https://movecraft.io/block_type/";
    
    public fun name(block_type_index: u64): vector<u8>{
        if(block_type_index == cell_0::block_type()){
            cell_0::name()
        }else if(block_type_index == cell_1::block_type()){
            cell_1::name()
        }else if(block_type_index == cell_2::block_type()){
            cell_2::name()
        }else if(block_type_index == cell_3::block_type()){
            cell_3::name()
        }else if(block_type_index == cell_4::block_type()){
            cell_4::name()
        }else if(block_type_index == cell_5::block_type()){
            cell_5::name()
        }else if(block_type_index == cell_6::block_type()){
            cell_6::name()
        }else if(block_type_index == cell_7::block_type()){
            cell_7::name()
        }else{
            abort ENOT_VALID_BLOCK_TYPE
        }
    }
    
    public fun description(block_type_index: u64): vector<u8>{
        if(block_type_index == cell_0::block_type()){
            cell_0::description()
        }else if(block_type_index == cell_1::block_type()){
            cell_1::description()
        }else if(block_type_index == cell_2::block_type()){
            cell_2::description()
        }else if(block_type_index == cell_3::block_type()){
            cell_3::description()
        }else if(block_type_index == cell_4::block_type()){
            cell_4::description()
        }else if(block_type_index == cell_5::block_type()){
            cell_5::description()
        }else if(block_type_index == cell_6::block_type()){
            cell_6::description()
        }else if(block_type_index == cell_7::block_type()){
            cell_7::description()
        }else{
            abort ENOT_VALID_BLOCK_TYPE
        }
    }
    
    public fun uri(block_type_index: u64): vector<u8>{
        let specific_uri = 
            if(block_type_index == cell_0::block_type()){
                cell_0::uri()
            }else if(block_type_index == cell_1::block_type()){
                cell_1::uri()
            }else if(block_type_index == cell_2::block_type()){
                cell_2::uri()
            }else if(block_type_index == cell_3::block_type()){
                cell_3::uri()
            }else if(block_type_index == cell_4::block_type()){
                cell_4::uri()
            }else if(block_type_index == cell_5::block_type()){
                cell_5::uri()
            }else if(block_type_index == cell_6::block_type()){
                cell_6::uri()
            }else if(block_type_index == cell_7::block_type()){
                cell_7::uri()
            }else{
                abort ENOT_VALID_BLOCK_TYPE
            };

        let origin = vector::empty<u8>();
        vector::append(&mut origin, BASE_URI);
        vector::append(&mut origin, specific_uri);
        origin
    }

    public fun is_mintable(block_type_index: u64): bool{
        if(block_type_index == cell_0::block_type()){
            cell_0::mintable()
        }else if(block_type_index == cell_1::block_type()){
            cell_1::mintable()
        }else if(block_type_index == cell_2::block_type()){
            cell_2::mintable()
        }else if(block_type_index == cell_3::block_type()){
            cell_3::mintable()
        }else if(block_type_index == cell_4::block_type()){
            cell_4::mintable()
        }else if(block_type_index == cell_5::block_type()){
            cell_5::mintable()
        }else if(block_type_index == cell_6::block_type()){
            cell_6::mintable()
        }else if(block_type_index == cell_7::block_type()){
            cell_7::mintable()
        }else{
            abort ENOT_VALID_BLOCK_TYPE
        }
    }

    public fun is_stackable(block_type_index: u64): bool{
        if(block_type_index == cell_0::block_type()){
            cell_0::stackable()
        }else if(block_type_index == cell_1::block_type()){
            cell_1::stackable()
        }else if(block_type_index == cell_2::block_type()){
            cell_2::stackable()
        }else if(block_type_index == cell_3::block_type()){
            cell_3::stackable()
        }else if(block_type_index == cell_4::block_type()){
            cell_4::stackable()
        }else if(block_type_index == cell_5::block_type()){
            cell_5::stackable()
        }else if(block_type_index == cell_6::block_type()){
            cell_6::stackable()
        }else if(block_type_index == cell_7::block_type()){
            cell_7::stackable()
        }else{
            abort ENOT_VALID_BLOCK_TYPE
        }
    }

}